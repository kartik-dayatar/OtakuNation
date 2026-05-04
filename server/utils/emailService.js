const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const STORE_NAME = 'Otaku Nation';
const STORE_URL  = process.env.STORE_URL || 'http://localhost:3000';
const ACCENT_COLOR = '#3b82f6';

/**
 * Common Base Template Wrapper
 */
const getBaseTemplate = (content, previewText = '') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { padding: 30px; text-align: center; border-bottom: 1px solid #f0f0f0; }
        .logo { color: ${ACCENT_COLOR}; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 40px 30px; line-height: 1.6; color: #333333; }
        .footer { padding: 30px; text-align: center; font-size: 12px; color: #999999; background-color: #fcfcfc; border-top: 1px solid #f0f0f0; }
        .btn { display: inline-block; padding: 14px 30px; background-color: ${ACCENT_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .item-row { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
        .item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 15px; background: #eee; }
        .item-info { flex: 1; }
        .item-name { font-weight: 600; color: #222; margin: 0; }
        .item-meta { font-size: 13px; color: #777; margin: 4px 0 0 0; }
        .summary-table { width: 100%; border-top: 2px solid #f0f0f0; margin-top: 20px; padding-top: 10px; }
        .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-row { font-size: 18px; font-weight: 800; color: #222; border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px; }
        h1, h2, h3 { color: #111; margin-top: 0; }
    </style>
</head>
<body>
    <div style="display:none;font-size:1px;color:#f9f9f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>
    <div class="container">
        <div class="header">
            <div class="logo">Otaku <span style="color: #111">Nation</span></div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>You're receiving this because you have an account or placed an order at Otaku Nation.</p>
            <p>&copy; ${new Date().getFullYear()} Otaku Nation. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Helper: Fire and forget sender
const send = async (options) => {
    if (!options.to) {
        console.warn('Email skipped: recipient address missing');
        return;
    }
    try {
        const info = await transporter.sendMail({
            from: `"${STORE_NAME}" <${process.env.EMAIL_USER}>`,
            ...options
        });
        console.log(`${options.subject} sent to ${options.to}`);
        return info;
    } catch (err) {
        console.error(`Email failed to ${options.to}:`, err.message);
    }
};

// ── 1. EMAIL VERIFICATION ────────────────────────────────
exports.sendVerificationEmail = async (user, token) => {
    const verifyUrl = `${STORE_URL}/verify-email/${token}`;
    const html = getBaseTemplate(`
        <h1>Verify Your Email ⚡</h1>
        <p>Hi ${user.firstName},</p>
        <p>Welcome to Otaku Nation! Please verify your email address to activate your account and start your journey into the world of premium anime gear.</p>
        <div style="text-align: center;">
            <a href="${verifyUrl}" class="btn">Verify Email</a>
        </div>
        <p style="font-size: 14px; color: #777;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `, "Verify your email to join the nation!");
    
    return send({
        to: user.email,
        subject: "Verify Your Otaku Nation Email ⚡",
        html
    });
};

// ── 2. WELCOME EMAIL ──────────────────────────────────────
exports.sendWelcomeEmail = async (user) => {
    const html = getBaseTemplate(`
        <h1>Welcome to the Nation! ⚡</h1>
        <p>Hi ${user.firstName},</p>
        <p>Your account is now verified. We're thrilled to have you as part of our community of anime enthusiasts!</p>
        <div style="text-align: center;">
            <a href="${STORE_URL}/products" class="btn">Start Shopping</a>
        </div>
        <div style="display: flex; justify-content: space-around; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            <div>
                <p style="font-size: 24px; margin: 0;">🎌</p>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">Exclusive Merch</p>
            </div>
            <div>
                <p style="font-size: 24px; margin: 0;">🚀</p>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">Fast Shipping</p>
            </div>
            <div>
                <p style="font-size: 24px; margin: 0;">🔄</p>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">Easy Returns</p>
            </div>
        </div>
    `, "Account verified! Welcome to Otaku Nation.");

    return send({
        to: user.email,
        subject: `Welcome to Otaku Nation, ${user.firstName}! ⚡`,
        html
    });
};

// ── 3. ORDER CONFIRMATION ─────────────────────────────────
exports.sendOrderConfirmation = async (user, order) => {
    const itemsHtml = order.items.map(item => `
        <div class="item-row">
            <img src="${item.image}" class="item-img" />
            <div class="item-info">
                <p class="item-name">${item.name}</p>
                <p class="item-meta">Qty: ${item.quantity} &times; ₹${item.price.toLocaleString()}</p>
            </div>
            <div style="font-weight: 600;">₹${(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `).join('');

    const html = getBaseTemplate(`
        <h1 style="color: #22c55e;">Order Confirmed! ✅</h1>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for your order! We've received your request and our team is already gathering your gear. You'll receive another email as soon as it ships.</p>
        
        <div style="background: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #777;">Order #${order._id}</p>
            <p style="margin: 5px 0 0 0; font-weight: bold;">Placed on ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <h3>Your Items</h3>
        ${itemsHtml}

        <div class="summary-table">
            <div class="summary-row"><span>Subtotal</span><span>₹${order.subtotal.toLocaleString()}</span></div>
            <div class="summary-row"><span>Shipping</span><span>₹${order.shippingCost.toLocaleString()}</span></div>
            ${order.discount > 0 ? `<div class="summary-row" style="color: #ef4444;"><span>Discount</span><span>-₹${order.discount.toLocaleString()}</span></div>` : ''}
            <div class="summary-row total-row"><span>Total</span><span>₹${order.totalAmount.toLocaleString()}</span></div>
        </div>

        <div style="margin-top: 30px;">
            <h3>Delivery Address</h3>
            <p style="font-size: 14px; color: #555; margin: 0;">
                ${order.shippingAddress.recipientName}<br>
                ${order.shippingAddress.addressLine1}<br>
                ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
            </p>
        </div>

        <p style="margin-top: 20px;">Estimated delivery: <strong>5-7 business days</strong></p>
        
        <div style="text-align: center;">
            <a href="${STORE_URL}/orders/${order._id}" class="btn">View Your Order</a>
        </div>
    `, `Thanks for your order, ${user.firstName}! Order #${order._id} is confirmed.`);

    return send({
        to: user.email,
        subject: `Order Confirmed! #${order._id} ✅`,
        html
    });
};

// ── 4. PAYMENT FAILED ─────────────────────────────────────
exports.sendPaymentFailed = async (user, order) => {
    const html = getBaseTemplate(`
        <h1 style="color: #ef4444;">Payment Failed ❌</h1>
        <p>Hi ${user.firstName},</p>
        <p>We're sorry, but we couldn't process the payment for your order <strong>#${order._id}</strong>. Don't worry, your items are still reserved for a short time.</p>
        
        <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #b91c1c;">Amount: ₹${order.totalAmount.toLocaleString()}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #7f1d1d;">Common reasons: Insufficient funds, card expired, or bank declined the transaction.</p>
        </div>

        <div style="text-align: center;">
            <a href="${STORE_URL}/checkout/${order._id}" class="btn">Retry Payment</a>
        </div>

        <p>If your bank shows a pending amount, it will typically be released within 24-48 hours. If you need help, feel free to <a href="${STORE_URL}/contact">contact support</a>.</p>
    `, "Action required: Payment failed for your order.");

    return send({
        to: user.email,
        subject: "Payment Failed for Your Order ❌",
        html
    });
};

// ── 5. ORDER SHIPPED ──────────────────────────────────────
exports.sendOrderShipped = async (user, order) => {
    const html = getBaseTemplate(`
        <h1>On Its Way! 🚚</h1>
        <p>Great news, ${user.firstName}! Your order <strong>#${order._id}</strong> has been shipped and is heading your way.</p>
        
        <div style="background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            ${order.trackingNumber ? `
                <p style="margin: 0; font-size: 14px; color: #0369a1;">Tracking Number</p>
                <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: bold; color: #0c4a6e;">${order.trackingNumber}</p>
            ` : ''}
            <a href="${STORE_URL}/order-tracking/${order._id}" class="btn" style="margin: 0;">Track Your Order</a>
        </div>

        <p>Estimated delivery: <strong>5-7 business days</strong></p>
        
        <h3>Shipped Items</h3>
        ${order.items.map(item => `<p style="margin: 5px 0; font-size: 14px;">• ${item.name} &times; ${item.quantity}</p>`).join('')}
    `, `Your Otaku Nation order #${order._id} has shipped!`);

    return send({
        to: user.email,
        subject: `Your Order is On Its Way! 🚚 #${order._id}`,
        html
    });
};

// ── 6. ORDER OUT FOR DELIVERY ─────────────────────────────
exports.sendOrderOutForDelivery = async (user, order) => {
    const html = getBaseTemplate(`
        <h1>Out For Delivery Today! 🛵</h1>
        <p>Hi ${user.firstName}, your order <strong>#${order._id}</strong> is out for delivery and should arrive sometime today!</p>
        
        <p>Please make sure someone is available at the shipping address to receive the package.</p>
        
        <h3>Delivering Today</h3>
        ${order.items.map(item => `<p style="margin: 5px 0; font-size: 14px;">• ${item.name} &times; ${item.quantity}</p>`).join('')}
        
        <p style="margin-top: 20px; font-size: 13px; color: #777;">If you have any issues with the delivery, please <a href="${STORE_URL}/contact">contact support</a> immediately.</p>
    `, `Your order #${order._id} will arrive today!`);

    return send({
        to: user.email,
        subject: `Your Order is Out for Delivery Today! 🛵 #${order._id}`,
        html
    });
};

// ── 7. ORDER DELIVERED ────────────────────────────────────
exports.sendOrderDelivered = async (user, order) => {
    const html = getBaseTemplate(`
        <h1 style="color: #22c55e;">Arrived! 📦</h1>
        <p>Hi ${user.firstName}, your order <strong>#${order._id}</strong> has been successfully delivered. We hope you love your new gear!</p>
        
        <p>We'd love to hear what you think about your purchase. Your feedback helps other fans in the community!</p>

        <div style="text-align: center;">
            <a href="${STORE_URL}/orders/${order._id}" class="btn">Leave a Review</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px;">Need help with your order? Just reply to this email or visit our <a href="${STORE_URL}/contact">Support Center</a>.</p>
    `, `Order #${order._id} has been delivered! Enjoy!`);

    return send({
        to: user.email,
        subject: `Your Order Has Arrived! 📦 #${order._id}`,
        html
    });
};

// ── 8. ORDER CANCELLED ────────────────────────────────────
exports.sendOrderCancelled = async (user, order) => {
    const html = getBaseTemplate(`
        <h1>Order Cancelled</h1>
        <p>Hi ${user.firstName}, we're confirming that order <strong>#${order._id}</strong> has been cancelled.</p>
        
        ${order.cancellationReason ? `<p>Reason: <em>${order.cancellationReason}</em></p>` : ''}

        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            ${order.paymentStatus === 'paid' ? 
                '<p style="margin: 0; color: #15803d;">Your refund has been initiated and will be processed within 5-7 business days.</p>' : 
                '<p style="margin: 0; color: #64748b;">No charge was made to your account for this order.</p>'
            }
        </div>

        <div style="text-align: center;">
            <a href="${STORE_URL}/products" class="btn">Shop Again</a>
        </div>
    `, `Confirmation: Order #${order._id} has been cancelled.`);

    return send({
        to: user.email,
        subject: `Your Order Has Been Cancelled #${order._id}`,
        html
    });
};

// ── 8a. RETURN REQUEST CONFIRMATION (USER) ────────────────
exports.sendReturnRequestConfirmation = async (user, order) => {
    const html = getBaseTemplate(`
        <h1>Return Request Received</h1>
        <p>Hi ${user.firstName},</p>
        <p>We've received your return request for order <strong>#${order._id}</strong>.</p>
        
        <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #9a3412;">Return Status: Pending Review</p>
            <p style="margin: 10px 0 0 0; color: #c2410c;">Reason: ${order.returnReason}</p>
        </div>

        <p>Our team will review your request within <strong>24-48 hours</strong> and contact you regarding the next steps.</p>

        <div style="text-align: center;">
            <a href="${STORE_URL}/orders/${order._id}" class="btn">View Order Status</a>
        </div>
    `, `Confirmation: Return request for order #${order._id} submitted.`);

    return send({
        to: user.email,
        subject: `Return Request Received - Order #${order._id}`,
        html
    });
};

// ── 8b. RETURN REQUEST NOTIFICATION (ADMIN) ───────────────
exports.sendAdminReturnNotification = async (order) => {
    const html = getBaseTemplate(`
        <h1>New Return Request</h1>
        <p>A new return request has been submitted for order <strong>#${order._id}</strong>.</p>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Customer:</strong> ${order.user.firstName} ${order.user.lastName}</p>
            <p><strong>Reason:</strong> ${order.returnReason}</p>
        </div>

        <div style="text-align: center;">
            <a href="${STORE_URL}/admin/orders/${order._id}" class="btn">Review Request</a>
        </div>
    `, `Admin Alert: New return request for order #${order._id}`);

    return send({
        to: process.env.EMAIL_USER,
        subject: `⚠️ New Return Request - Order #${order._id}`,
        html
    });
};

// ── 9. REFUND INITIATED ───────────────────────────────────
exports.sendRefundInitiated = async (user, order, amount) => {
    const html = getBaseTemplate(`
        <h1>Refund Initiated 💸</h1>
        <p>Hi ${user.firstName}, we have initiated a refund of <strong>₹${amount.toLocaleString()}</strong> for your order <strong>#${order._id}</strong>.</p>
        
        <p>The amount is being returned to your original payment method. Please note that it typically takes <strong>5-7 business days</strong> for the funds to reflect in your account, depending on your bank's processing time.</p>
        
        <p>If you have any questions, our support team is here to help.</p>
    `, `Refund initiated for order #${order._id}`);

    return send({
        to: user.email,
        subject: `Refund Initiated for Order #${order._id} 💸`,
        html
    });
};

// ── 10. REFUND SUCCESSFUL ─────────────────────────────────
exports.sendRefundSuccessful = async (user, order, amount) => {
    const html = getBaseTemplate(`
        <h1 style="color: #22c55e;">Refund Successful! ✅</h1>
        <p>Hi ${user.firstName}, the refund for your order <strong>#${order._id}</strong> has been successfully processed.</p>
        
        <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #166534;">Refunded Amount</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #14532d;">₹${amount.toLocaleString()}</p>
        </div>

        <p>The amount has been credited back to your original payment method. Thank you for your patience!</p>

        <div style="text-align: center;">
            <a href="${STORE_URL}/products" class="btn">Shop Again</a>
        </div>
    `, `Refund of ₹${amount.toLocaleString()} successful for order #${order._id}`);

    return send({
        to: user.email,
        subject: `Refund Successful! ₹${amount.toLocaleString()} Returned #${order._id} ✅`,
        html
    });
};

// ── 11. PASSWORD RESET (OTP) ─────────────────────────────
exports.sendPasswordResetEmail = async (user, otp) => {
    const html = getBaseTemplate(`
        <h1>Reset Your Password 🔐</h1>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset for your Otaku Nation account. Use the OTP below to complete the process:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6; border: 2px dashed #3b82f6; padding: 16px 32px; text-align: center; border-radius: 8px; display: inline-block;">
                ${otp}
            </div>
        </div>

        <p>This OTP is valid for <strong>10 minutes</strong> only. Never share this OTP with anyone.</p>
        <p style="font-size: 14px; color: #777;">If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
    `, "Your Otaku Nation Password Reset OTP");

    return send({
        to: user.email,
        subject: "Your Otaku Nation Password Reset OTP 🔐",
        html
    });
};

// ── 12. PASSWORD CHANGED ──────────────────────────────────
exports.sendPasswordChangedConfirmation = async (user) => {
    const html = getBaseTemplate(`
        <h1>Password Changed 🔐</h1>
        <p>Hi ${user.firstName},</p>
        <p>This is a confirmation that the password for your account was changed on <strong>${new Date().toLocaleString()}</strong>.</p>
        
        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #4b5563;">If this was you, no further action is needed. If you did not make this change, please contact our security team immediately.</p>
        </div>

        <div style="text-align: center;">
            <a href="${STORE_URL}/contact" class="btn">Contact Support</a>
        </div>
    `, "Security Alert: Your password has been changed.");

    return send({
        to: user.email,
        subject: "Your Password Has Been Changed 🔐",
        html
    });
};

// ── 13. NEW LOGIN ALERT ───────────────────────────────────
exports.sendNewLoginAlert = async (user, deviceDetails) => {
    const html = getBaseTemplate(`
        <h1>New Login Detected 🔒</h1>
        <p>Hi ${user.firstName},</p>
        <p>A new login was detected on your Otaku Nation account from a new device or browser.</p>
        
        <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #9a3412;">Login Details</p>
            <p style="margin: 10px 0 0 0; font-weight: bold; color: #7c2d12;">${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #c2410c;">Device: ${deviceDetails}</p>
        </div>

        <p>If this was you, you can safely ignore this email. If this wasn't you, we recommend resetting your password immediately to secure your account.</p>

        <div style="text-align: center;">
            <a href="${STORE_URL}/forgot-password" class="btn">Reset Password</a>
        </div>
    `, "Security Alert: New login to your account.");

    return send({
        to: user.email,
        subject: "New Login to Your Otaku Nation Account 🔒",
        html
    });
};

// ── 14. WISHLIST BACK IN STOCK ────────────────────────────
exports.sendBackInStockEmail = async (user, product) => {
    const html = getBaseTemplate(`
        <h1>Back in Stock! ⚡</h1>
        <p>Hi ${user.firstName},</p>
        <p>Good news! An item from your wishlist is back in stock and ready for you to grab.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <img src="${product.image}" style="max-width: 200px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
            <h2 style="margin: 15px 0 5px 0;">${product.name}</h2>
            <p style="color: #3b82f6; font-weight: bold; font-size: 18px;">₹${product.price.toLocaleString()}</p>
            <p style="font-style: italic; color: #ef4444;">It's back and selling fast!</p>
            <a href="${STORE_URL}/product/${product._id}" class="btn">Shop Now</a>
        </div>
    `, `${product.name} is back in stock at Otaku Nation!`);

    return send({
        to: user.email,
        subject: `${product.name} is Back in Stock! ⚡`,
        html
    });
};

// ── 15. ABANDONED CART ────────────────────────────────────
exports.sendAbandonedCartReminder = async (user, cartItems, total) => {
    const itemsHtml = cartItems.map(item => `
        <div class="item-row">
            <img src="${item.product.image}" class="item-img" />
            <div class="item-info">
                <p class="item-name">${item.product.name}</p>
                <p class="item-meta">₹${item.product.price.toLocaleString()}</p>
            </div>
        </div>
    `).join('');

    const html = getBaseTemplate(`
        <h1>You Left Something Behind... 👀</h1>
        <p>Hi ${user.firstName},</p>
        <p>We noticed you left some awesome anime gear in your cart. They're still waiting for you, but they won't last forever!</p>
        
        <div style="margin: 20px 0;">
            ${itemsHtml}
        </div>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: right; margin-bottom: 20px;">
            <span style="font-size: 14px; color: #64748b;">Cart Total: </span>
            <span style="font-size: 20px; font-weight: bold; color: #1e293b;">₹${total.toLocaleString()}</span>
        </div>

        <div style="text-align: center;">
            <a href="${STORE_URL}/cart" class="btn">Complete Your Order</a>
        </div>

        <p style="text-align: center; font-style: italic; color: #ef4444; margin-top: 20px;">Items sell out fast! Grab yours before someone else does.</p>
    `, "Don't miss out on your anime gear! Complete your order.");

    return send({
        to: user.email,
        subject: "You Left Something Behind... 👀",
        html
    });
};

// ── 16. REVIEW APPROVED ───────────────────────────────────
exports.sendReviewApproved = async (user, product, review) => {
    const html = getBaseTemplate(`
        <h1 style="color: #22c55e;">Review Published! ⭐</h1>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for sharing your thoughts! Your review for <strong>${product.name}</strong> has been approved and is now live on the store.</p>
        
        <div style="background: #f9f9f9; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #f59e0b;">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</p>
            <p style="margin: 0; font-style: italic; color: #4b5563;">"${review.comment.substring(0, 150)}${review.comment.length > 150 ? '...' : ''}"</p>
        </div>

        <div style="text-align: center;">
            <a href="${STORE_URL}/product/${product._id}" class="btn">View Your Review</a>
        </div>
    `, "Your product review is live!");

    return send({
        to: user.email,
        subject: "Your Review Has Been Published! ⭐",
        html
    });
};

// ── 17. CONTACT FORM (USER & ADMIN) ───────────────────────
exports.sendContactConfirmation = async (contactData) => {
    // 1. Send to User
    const userHtml = getBaseTemplate(`
        <h1>We Got Your Message! 👋</h1>
        <p>Hi ${contactData.name},</p>
        <p>Thank you for reaching out to Otaku Nation. We've received your message and our team will get back to you as soon as possible.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #555;">
            <p style="margin: 0; font-weight: bold; color: #333;">Your Message Snippet:</p>
            <p style="margin: 5px 0 0 0;">"${contactData.message.substring(0, 200)}..."</p>
        </div>

        <p>We typically reply within <strong>24 hours</strong>. In the meantime, feel free to browse our latest arrivals.</p>
        
        <div style="text-align: center;">
            <a href="${STORE_URL}/products" class="btn">Browse Store</a>
        </div>
    `, "We've received your contact message.");

    send({
        to: contactData.email,
        subject: "We Got Your Message! We'll Be in Touch Soon 👋",
        html: userHtml
    });

    // 2. Send to Admin
    const adminHtml = getBaseTemplate(`
        <h1>New Contact Submission</h1>
        <p><strong>From:</strong> ${contactData.name} (${contactData.email})</p>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="white-space: pre-wrap;">${contactData.message}</p>
        </div>
        <div style="text-align: center;">
            <a href="mailto:${contactData.email}" class="btn">Reply to ${contactData.email}</a>
        </div>
    `, `New message from ${contactData.name}`);

    send({
        to: process.env.EMAIL_USER,
        subject: `New Contact Form Submission from ${contactData.name}`,
        html: adminHtml
    });
};

// ── 18. LOW STOCK ALERT (ADMIN) ───────────────────────────
exports.sendLowStockAlert = async (products) => {
    if (!products || products.length === 0) return;

    const rows = products.map(p => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${p.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #ef4444; font-weight: bold;">${p.stockQuantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 12px;">${p._id}</td>
        </tr>
    `).join('');

    const html = getBaseTemplate(`
        <h1 style="color: #ef4444;">⚠️ Low Stock Alert</h1>
        <p>The following products have reached critical stock levels (5 or below) and may need restocking soon.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: #f8fafc;">
                    <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b;">Product</th>
                    <th style="padding: 10px; text-align: center; font-size: 12px; text-transform: uppercase; color: #64748b;">Stock</th>
                    <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b;">ID</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <div style="text-align: center;">
            <a href="${STORE_URL}/admin/inventory" class="btn">Manage Inventory</a>
        </div>
    `, `Critical stock alert for ${products.length} products.`);

    return send({
        to: process.env.EMAIL_USER,
        subject: `⚠️ Low Stock Alert - ${products.length} Products Need Attention`,
        html
    });
};
