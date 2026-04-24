const Order    = require("../models/Order");
const Product  = require("../models/Product");
const Coupon   = require("../models/Coupon");
const GiftCard = require("../models/GiftCard");
const User     = require("../models/User");

// ────────────────────────────────────────────────────
// POST /api/orders   (protected)
// Body: {
//   items, shippingAddress, paymentMethod,
//   couponCode?, giftCardCode?
// }
// The server recomputes all financial totals authoritatively —
// it never trusts the client-supplied totals.
// ────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            couponCode,
            giftCardCode,
        } = req.body;

        if (!items || items.length === 0) {
            res.status(400);
            throw new Error("No order items provided");
        }

        // ── 1. Validate & snapshot each item from DB ──────
        let subtotal = 0;
        const snapshotItems = [];

        for (const incoming of items) {
            const product = await Product.findById(incoming.product || incoming.productId);
            if (!product) {
                res.status(400);
                throw new Error(`Product not found: ${incoming.product || incoming.productId}`);
            }
            if (product.status !== "active") {
                res.status(400);
                throw new Error(`Product "${product.name}" is no longer available`);
            }

            const qty       = Number(incoming.quantity) || 1;
            const unitPrice = product.price;
            const lineTotal = unitPrice * qty;
            subtotal       += lineTotal;

            snapshotItems.push({
                product:      product._id,
                productName:  product.name,
                productImage: product.images?.find((i) => i.isPrimary)?.url
                              || product.images?.[0]?.url
                              || null,
                sizeLabel:    incoming.sizeLabel || null,
                unitPrice,
                quantity:     qty,
                lineTotal,
            });
        }

        // ── 2. Shipping ───────────────────────────────────
        const FREE_SHIPPING_MIN = 5000;
        const FLAT_SHIPPING     = 99;
        const shippingAmount    = subtotal >= FREE_SHIPPING_MIN ? 0 : FLAT_SHIPPING;

        // ── 3. Coupon validation ──────────────────────────
        let discountAmount = 0;
        let appliedCoupon  = null;
        let appliedCouponCode = null;

        if (couponCode) {
            const code   = couponCode.trim().toUpperCase();
            const coupon = await Coupon.findOne({ code, isActive: true });

            if (!coupon) {
                res.status(400);
                throw new Error(`Coupon "${code}" is invalid or inactive`);
            }
            // Expiry check
            if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
                res.status(400);
                throw new Error(`Coupon "${code}" has expired`);
            }
            // Minimum order check
            if (subtotal < coupon.minOrderAmount) {
                res.status(400);
                throw new Error(
                    `Coupon "${code}" requires a minimum order of ₹${coupon.minOrderAmount}`
                );
            }
            // Max-uses check
            if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
                res.status(400);
                throw new Error(`Coupon "${code}" has reached its maximum usage limit`);
            }

            // Calc discount
            if (coupon.type === "percent") {
                discountAmount = Math.round((subtotal * coupon.value) / 100);
            } else {
                discountAmount = Math.min(coupon.value, subtotal);
            }

            appliedCoupon     = coupon._id;
            appliedCouponCode = code;

            // Increment usage count atomically
            await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usesCount: 1 } });
        }

        // ── 4. Gift Card validation ───────────────────────
        let giftCardDiscount = 0;

        if (giftCardCode) {
            const gcCode   = giftCardCode.trim().toUpperCase();
            const giftCard = await GiftCard.findOne({ code: gcCode, isActive: true });

            if (!giftCard) {
                res.status(400);
                throw new Error(`Gift card "${gcCode}" is invalid or inactive`);
            }
            // Expiry check
            if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
                res.status(400);
                throw new Error(`Gift card "${gcCode}" has expired`);
            }
            // Prevent same user redeeming the same card twice
            const alreadyUsed = giftCard.usages.some(
                (u) => u.usedBy.toString() === req.user._id.toString()
            );
            if (alreadyUsed) {
                res.status(400);
                throw new Error(`You have already used gift card "${gcCode}"`);
            }

            giftCardDiscount = giftCard.denomination;

            // Record usage (order ref will be added after order is created)
            giftCard.usages.push({ usedBy: req.user._id });
            await giftCard.save();
        }

        // ── 5. Final total ────────────────────────────────
        const totalDiscount  = discountAmount + giftCardDiscount;
        const totalAmount    = Math.max(0, subtotal + shippingAmount - totalDiscount);

        // ── 6. Create order ───────────────────────────────
        const order = await Order.create({
            user:            req.user._id,
            items:           snapshotItems,
            shippingAddress,
            paymentMethod:   paymentMethod || "COD",
            subtotal,
            shippingAmount,
            discountAmount:  totalDiscount,
            totalAmount,
            coupon:          appliedCoupon,
            couponCode:      appliedCouponCode,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // ── 7. Clear user's cart ──────────────────────────
        await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/orders/mine   (protected – current user)
// ────────────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/orders/:id   (protected)
// ────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "firstName lastName email");

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        // Users can only view their own orders; admins can view all
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            res.status(403);
            throw new Error("Access denied");
        }

        res.json(order);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/orders   (admin)
// ────────────────────────────────────────────────────
const getAllOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = status ? { status } : {};

        const total  = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("user", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// PUT /api/orders/:id/status   (admin)
// ────────────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        order.status = status;
        order.statusHistory.push({ status, note: note || "" });

        if (status === "delivered") {
            order.deliveredAt   = new Date();
            order.paymentStatus = "paid";
        }

        const updated = await order.save();
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// PUT /api/orders/:id/cancel   (protected user)
// ────────────────────────────────────────────────────
const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        if (order.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("Not authorised to cancel this order");
        }

        if (["shipped", "delivered"].includes(order.status)) {
            res.status(400);
            throw new Error("Cannot cancel an already shipped or delivered order");
        }

        order.status = "cancelled";
        order.statusHistory.push({ status: "cancelled", note: req.body.reason || "Cancelled by user" });
        await order.save();
        res.json({ message: "Order cancelled", order });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/orders/validate-promo   (protected)
// Validates a coupon or gift card before checkout
// Body: { couponCode?, giftCardCode?, subtotal }
// ────────────────────────────────────────────────────
const validatePromo = async (req, res, next) => {
    try {
        const { couponCode, giftCardCode, subtotal } = req.body;

        if (couponCode) {
            const code   = couponCode.trim().toUpperCase();
            const coupon = await Coupon.findOne({ code, isActive: true });

            if (!coupon)
                return res.status(400).json({ valid: false, message: `Coupon "${code}" is invalid or inactive` });
            if (coupon.validUntil && new Date(coupon.validUntil) < new Date())
                return res.status(400).json({ valid: false, message: `Coupon "${code}" has expired` });
            if (subtotal < coupon.minOrderAmount)
                return res.status(400).json({
                    valid: false,
                    message: `Coupon "${code}" requires a minimum order of ₹${coupon.minOrderAmount}`,
                });
            if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses)
                return res.status(400).json({ valid: false, message: `Coupon "${code}" has reached its usage limit` });

            const discount = coupon.type === "percent"
                ? Math.round((subtotal * coupon.value) / 100)
                : Math.min(coupon.value, subtotal);

            return res.json({
                valid: true,
                type: "coupon",
                code,
                discountType: coupon.type,
                discountValue: coupon.value,
                discount,
                label: coupon.type === "percent" ? `${coupon.value}% off` : `₹${coupon.value} off`,
            });
        }

        if (giftCardCode) {
            const gcCode   = giftCardCode.trim().toUpperCase();
            const giftCard = await GiftCard.findOne({ code: gcCode, isActive: true });

            if (!giftCard)
                return res.status(400).json({ valid: false, message: `Gift card "${gcCode}" is invalid or inactive` });
            if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date())
                return res.status(400).json({ valid: false, message: `Gift card "${gcCode}" has expired` });

            const alreadyUsed = giftCard.usages.some(
                (u) => u.usedBy.toString() === req.user._id.toString()
            );
            if (alreadyUsed)
                return res.status(400).json({ valid: false, message: `You have already used gift card "${gcCode}"` });

            return res.json({
                valid: true,
                type: "giftcard",
                code: gcCode,
                discount: giftCard.denomination,
                label: `₹${giftCard.denomination} gift card`,
            });
        }

        res.status(400).json({ valid: false, message: "Provide a couponCode or giftCardCode" });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createOrder, getMyOrders, getOrderById, getAllOrders,
    updateOrderStatus, cancelOrder, validatePromo,
};
