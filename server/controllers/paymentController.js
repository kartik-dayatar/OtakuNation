const crypto = require("crypto");
const razorpay = require("../utils/razorpay");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const GiftCard = require("../models/GiftCard");
const { sendOrderConfirmation, sendPaymentFailed, sendLowStockAlert } = require("../utils/emailService");

// ── CREATE ORDER ──────────────────────────────────────────
const createOrder = async (req, res, next) => {
    try {
        const { amount, currency = "INR" } = req.body;
        
        // Razorpay expects amount in paise (Rupees * 100)
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        
        res.status(201).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error("Razorpay Order Creation Failed:", err);
        res.status(500).json({ message: "Failed to initialize payment with Razorpay" });
    }
};

// ── VERIFY PAYMENT & CREATE ORDER ──────────────────────────
const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // Temporary Debug Logs
        console.log('--- Razorpay Verification Debug ---');
        console.log('Expected:', expectedSignature);
        console.log('Received:', razorpay_signature);
        console.log('Match:', expectedSignature === razorpay_signature);
        console.log('-----------------------------------');

        if (expectedSignature !== razorpay_signature) {
            console.error("Payment Verification Failed: Signatures do not match");
            return res.status(400).json({ message: "Payment verification failed" });
        }

        // ── 1. Fetch Razorpay Payment Details (for audit) ──
        let paymentDetails = "Razorpay Online";
        try {
            const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
            if (rzpPayment.method === 'card') {
                paymentDetails = `${rzpPayment.card.network} Card ****${rzpPayment.card.last4}`;
            } else if (rzpPayment.method === 'upi') {
                paymentDetails = `UPI (${rzpPayment.vpa || 'Mobile'})`;
            } else if (rzpPayment.method === 'netbanking') {
                paymentDetails = `Netbanking (${rzpPayment.bank})`;
            } else if (rzpPayment.method === 'wallet') {
                paymentDetails = `Wallet (${rzpPayment.wallet})`;
            }
        } catch (rzpErr) {
            console.warn("Failed to fetch Razorpay payment details for audit:", rzpErr);
        }

        // ── 2. Authoritative Re-calculation (Security) ──
        const { items, shippingAddress, couponCode, giftCardCode } = orderData;
        let subtotal = 0;
        const snapshotItems = [];

        for (const incoming of items) {
            const product = await Product.findById(incoming.product || incoming.productId);
            if (!product) throw new Error(`Product not found: ${incoming.product || incoming.productId}`);
            
            const qty       = Number(incoming.quantity) || 1;
            const unitPrice = product.price;
            subtotal       += unitPrice * qty;

            snapshotItems.push({
                product:      product._id,
                productName:  product.name,
                productImage: product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url,
                sizeLabel:    incoming.sizeLabel || null,
                colorLabel:   incoming.colorLabel || null,
                unitPrice,
                purchaseCost: product.costPrice || 0,
                quantity:     qty,
                lineTotal:    unitPrice * qty
            });
        }

        const FREE_SHIPPING_MIN = 5000;
        const shippingAmount = subtotal >= FREE_SHIPPING_MIN ? 0 : 99;
        const taxAmount = Math.round(subtotal - (subtotal * (100 / 118)));

        let discountAmount = 0;
        let appliedCoupon = null;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
            if (coupon) {
                discountAmount = coupon.type === "percent" 
                    ? Math.round((subtotal * coupon.value) / 100) 
                    : Math.min(coupon.value, subtotal);
                appliedCoupon = coupon._id;
                await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usesCount: 1 } });
            }
        }

        let giftCardDiscount = 0;
        if (giftCardCode) {
            const giftCard = await GiftCard.findOne({ code: giftCardCode.trim().toUpperCase(), isActive: true });
            if (giftCard) {
                giftCardDiscount = giftCard.denomination;
                giftCard.usages.push({ usedBy: req.user._id });
                await giftCard.save();
            }
        }

        const totalDiscount = discountAmount + giftCardDiscount;
        const totalAmount = Math.max(0, subtotal + shippingAmount - totalDiscount);

        // ── 3. Create Order in DB ──────────────────────────
        const newOrder = new Order({
            user: req.user._id,
            items: snapshotItems,
            shippingAddress,
            subtotal,
            shippingAmount,
            taxAmount,
            discountAmount: totalDiscount,
            totalAmount,
            coupon: appliedCoupon,
            couponCode,
            paymentMethod: "razorpay",
            paymentStatus: "paid",
            paymentReference: razorpay_payment_id,
            paymentDetails,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            status: "confirmed",
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Online is usually faster
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
        });

        await newOrder.save();

        // Background Actions
        try {
            await User.findByIdAndUpdate(req.user._id, { cart: [] });

            const lowStockProducts = [];
            for (const item of snapshotItems) {
                const product = await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stockQuantity: -item.quantity } },
                    { new: true }
                );
                if (product && product.stockQuantity <= product.lowStockThreshold) {
                    lowStockProducts.push(product);
                }
            }

            await sendOrderConfirmation(req.user, newOrder);
            if (lowStockProducts.length > 0) {
                await sendLowStockAlert(lowStockProducts);
            }
        } catch (bgErr) {
            console.error("Background processing error after payment:", bgErr);
        }

        res.json({ success: true, orderId: newOrder._id });

    } catch (err) {
        console.error("Payment Verification Error:", err);
        res.status(500).json({ 
            message: "Order creation failed after payment. Please contact support with your Payment ID.",
            paymentId: req.body.razorpay_payment_id 
        });
    }
};

// ── PAYMENT FAILED ────────────────────────────────────────
const paymentFailed = async (req, res, next) => {
    try {
        const { razorpay_order_id, error } = req.body;
        console.error(`Payment Failed for Razorpay Order ${razorpay_order_id}:`, error);

        // Send failure email
        await sendPaymentFailed(req.user, { _id: "N/A", totalAmount: 0 }); // Placeholder order obj for email

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    paymentFailed
};
