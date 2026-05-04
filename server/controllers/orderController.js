const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const GiftCard = require("../models/GiftCard");
const User     = require("../models/User");
const emailService = require("../utils/emailService");

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

            const qty = Number(incoming.quantity) || 1;
            const unitPrice = product.price;
            const lineTotal = unitPrice * qty;
            subtotal += lineTotal;

            snapshotItems.push({
                product: product._id,
                productName: product.name,
                productImage: product.images?.find((i) => i.isPrimary)?.url
                              || product.images?.[0]?.url
                              || null,
                sizeLabel:    incoming.sizeLabel || null,
                colorLabel:   incoming.colorLabel || null,
                unitPrice,
                purchaseCost: product.costPrice || 0,
                quantity:     qty,
                lineTotal,
            });
        }

        // ── 2. Shipping ───────────────────────────────────
        const FREE_SHIPPING_MIN = 5000;
        const FLAT_SHIPPING = 99;
        const shippingAmount = subtotal >= FREE_SHIPPING_MIN ? 0 : FLAT_SHIPPING;

        // ── 3. Financials (Tax calculation) ───────────────
        // Assuming 18% GST is included in the price (Reverse GST calculation)
        // GST Amount = Amount - [Amount * (100 / (100 + GST%))]
        const taxAmount = Math.round(subtotal - (subtotal * (100 / 118)));

        // ── 4. Coupon validation ──────────────────────────
        let discountAmount = 0;
        let appliedCoupon = null;
        let appliedCouponCode = null;

        if (couponCode) {
            const code = couponCode.trim().toUpperCase();
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

            appliedCoupon = coupon._id;
            appliedCouponCode = code;

            // Increment usage count atomically
            await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usesCount: 1 } });
        }

        // ── 5. Gift Card validation ───────────────────────
        let giftCardDiscount = 0;

        if (giftCardCode) {
            const gcCode = giftCardCode.trim().toUpperCase();
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

        // ── 6. Final total ────────────────────────────────
        const totalDiscount  = discountAmount + giftCardDiscount;
        const totalAmount    = Math.max(0, subtotal + shippingAmount - totalDiscount);

        // ── 7. Create order ───────────────────────────────
        const order = await Order.create({
            user: req.user._id,
            items: snapshotItems,
            shippingAddress,
            paymentMethod: paymentMethod || "COD",
            subtotal,
            shippingAmount,
            taxAmount,
            discountAmount:  totalDiscount,
            totalAmount,
            coupon: appliedCoupon,
            couponCode: appliedCouponCode,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ipAddress:       req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent:       req.headers['user-agent'],
        });

        // ── 7. Update Stock & Check Low Stock ───────────
        const lowStockProducts = [];
        for (const item of snapshotItems) {
            const updatedProduct = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stockQuantity: -item.quantity } },
                { new: true }
            );
            if (updatedProduct && updatedProduct.stockQuantity <= 5) {
                lowStockProducts.push(updatedProduct);
            }
        }

        // ── 8. Send Emails (Fire & Forget) ────────────────
        emailService.sendOrderConfirmation(req.user, {
            ...order.toObject(),
            items: snapshotItems.map(i => ({
                name:  i.productName,
                image: i.productImage,
                quantity: i.quantity,
                price: i.unitPrice
            })),
            subtotal,
            shippingCost: shippingAmount,
            discount: totalDiscount
        }).catch(console.error);

        if (lowStockProducts.length > 0) {
            emailService.sendLowStockAlert(lowStockProducts).catch(console.error);
        }

        // ── 9. Clear user's cart ──────────────────────────
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

        const total = await Order.countDocuments(filter);
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
        const order = await Order.findById(req.params.id).populate("user", "firstName lastName email");

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        order.status = status;
        order.statusHistory.push({ status, note: note || "" });

        if (status === "delivered") {
            order.deliveredAt = new Date();
            order.paymentStatus = "paid";
        }

        const updated = await order.save();

        // Send Status Emails
        const emailData = {
            ...updated.toObject(),
            items: updated.items.map(i => ({ name: i.productName, quantity: i.quantity }))
        };

        if (status === "shipped") {
            emailService.sendOrderShipped(updated.user, emailData).catch(console.error);
        } else if (status === "out_for_delivery") {
            emailService.sendOrderOutForDelivery(updated.user, emailData).catch(console.error);
        } else if (status === "delivered") {
            emailService.sendOrderDelivered(updated.user, emailData).catch(console.error);
        } else if (status === "cancelled") {
            emailService.sendOrderCancelled(updated.user, emailData).catch(console.error);
        } else if (status === "payment_failed") {
            emailService.sendPaymentFailed(updated.user, emailData).catch(console.error);
        }

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
        const order = await Order.findById(req.params.id).populate("user", "firstName lastName email");

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        if (order.user._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("Not authorised to cancel this order");
        }

        // Cancellation Rule: Allowed only if confirmed or processing
        if (!["confirmed", "processing"].includes(order.status)) {
            res.status(400);
            throw new Error("Order cannot be cancelled at this stage");
        }

        // Update Order
        const reason = req.body.reason || "Changed my mind";
        order.status = "cancelled";
        order.cancelReason = reason;
        order.cancelledAt = new Date();
        order.cancelledBy = "user";
        order.statusHistory.push({ status: "cancelled", note: `Cancelled by user. Reason: ${reason}` });

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stockQuantity: item.quantity } }
            );
        }

        // Handle refund initiation for paid orders
        if (order.paymentStatus === "paid") {
            order.paymentStatus = "refund_initiated";
        }

        const updated = await order.save();

        // Send cancellation email
        const emailData = {
            ...updated.toObject(),
            cancellationReason: reason,
            items: updated.items.map(i => ({ name: i.productName, quantity: i.quantity }))
        };
        emailService.sendOrderCancelled(updated.user, emailData).catch(console.error);

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/orders/:id/return   (protected user)
// ────────────────────────────────────────────────────
const requestReturn = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "firstName lastName email");

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        if (order.user._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("Not authorised to request return for this order");
        }

        if (order.status !== "delivered") {
            res.status(400);
            throw new Error("Only delivered orders can be returned");
        }

        if (!order.deliveredAt) {
            res.status(400);
            throw new Error("Delivery date not recorded. Please contact support.");
        }

        // Check 7-day window
        const daysSinceDelivery = (Date.now() - order.deliveredAt) / (1000 * 60 * 60 * 24);
        if (daysSinceDelivery > 7) {
            res.status(400);
            throw new Error("Return window of 7 days has expired");
        }

        if (order.returnRequested) {
            res.status(400);
            throw new Error("Return already requested for this order");
        }

        // Update Order
        const reason = req.body.reason || "No reason provided";
        order.returnRequested = true;
        order.returnReason = reason;
        order.returnRequestedAt = new Date();
        order.returnStatus = "requested";
        order.statusHistory.push({ status: "returned", note: `Return requested. Reason: ${reason}` });

        const updated = await order.save();

        // Send Emails
        emailService.sendReturnRequestConfirmation(updated.user, updated).catch(console.error);
        emailService.sendAdminReturnNotification(updated).catch(console.error);

        res.json(updated);
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
            const code = couponCode.trim().toUpperCase();
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
            const gcCode = giftCardCode.trim().toUpperCase();
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
    updateOrderStatus, cancelOrder, requestReturn, validatePromo,
};
