const nodemailer = require('nodemailer');

// ── Transporter Configuration ─────────────────────────
// For development, we can use Ethereal (mock SMTP) or actual SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Core send email function
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"OtakuNation" <noreply@otakunation.com>',
            to,
            subject,
            text,
            html,
        });

        console.log(`[EmailService] Message sent: %s`, info.messageId);
        // If using Ethereal, log the preview URL
        if (info.messageId && process.env.SMTP_HOST?.includes('ethereal')) {
            console.log(`[EmailService] Preview URL: %s`, nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error(`[EmailService] Error:`, error.message);
        // Don't throw — we don't want email failures to crash the site
        return null;
    }
};

/**
 * Order Confirmation Email
 */
const sendOrderConfirmationEmail = async (order, user) => {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName} x ${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.lineTotal.toLocaleString()}</td>
        </tr>
    `).join('');

    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto;">
            <div style="background: #ef4444; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">Order Confirmed!</h1>
                <p style="margin: 5px 0 0;">Order #${order.orderNumber}</p>
            </div>
            <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Hi ${user.firstName},</p>
                <p>Thank you for shopping with <strong>OtakuNation</strong>! Your order has been placed successfully and is being processed.</p>
                
                <h3 style="border-bottom: 2px solid #ef4444; padding-bottom: 5px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${itemsHtml}
                    <tr>
                        <td style="padding: 10px; font-weight: bold;">Total Amount</td>
                        <td style="padding: 10px; font-weight: bold; text-align: right;">₹${order.totalAmount.toLocaleString()}</td>
                    </tr>
                </table>

                <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 6px;">
                    <p style="margin: 0;"><strong>Shipping Address:</strong><br>
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>
                </div>

                <p style="margin-top: 30px;">Expected delivery in 3-5 business days. You can track your order in your dashboard.</p>
                <p>Stay Awesome,<br>The OtakuNation Team</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 0.8rem;">
                &copy; 2024 OtakuNation. All rights reserved.
            </div>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: `Order Confirmed - #${order.orderNumber} | OtakuNation`,
        html,
        text: `Order Confirmed: #${order.orderNumber}. Total: ₹${order.totalAmount}. Thank you for your order!`
    });
};

/**
 * Newsletter Welcome Email
 */
const sendNewsletterWelcomeEmail = async (email) => {
    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; text-align: center; padding: 40px; border: 1px solid #eee; border-radius: 12px;">
            <img src="https://otakunation.com/logo.png" alt="OtakuNation" style="height: 50px; margin-bottom: 20px;">
            <h1 style="color: #ef4444;">Welcome to the Nation! 🎌</h1>
            <p style="font-size: 1.1rem;">Thanks for subscribing to the OtakuNation newsletter.</p>
            <p>You're now on the list to receive first-look access to new drops, exclusive discount codes, and the latest anime news.</p>
            <div style="margin: 30px 0; padding: 20px; background: #fff5f5; border: 1px dashed #ef4444; border-radius: 8px;">
                <p style="margin: 0; font-size: 0.9rem; color: #b91c1c;">USE CODE AT CHECKOUT FOR 10% OFF:</p>
                <h2 style="margin: 10px 0; letter-spacing: 2px;">WELCOME10</h2>
            </div>
            <p style="color: #6b7280; font-size: 0.9rem;">We promise to only send the good stuff (no spam, ever).</p>
            <p style="margin-top: 40px;">See you in the shop!</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "Welcome to OtakuNation! (Plus a little something inside...)",
        html,
        text: "Welcome to OtakuNation! Use code WELCOME10 for 10% off your first order."
    });
};

/**
 * Password Reset Email
 */
const sendPasswordResetEmail = async (email, token) => {
    // Determine the frontend URL based on environment or default to localhost:5173
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; text-align: center; padding: 40px; border: 1px solid #eee; border-radius: 12px;">
            <img src="https://otakunation.com/logo.png" alt="OtakuNation" style="height: 50px; margin-bottom: 20px;">
            <h1 style="color: #ef4444;">Reset Your Password</h1>
            <p style="font-size: 1.1rem;">You requested a password reset for your OtakuNation account.</p>
            <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
            
            <div style="margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <p style="color: #6b7280; font-size: 0.9rem;">If you didn't request this, you can safely ignore this email.</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "Password Reset Request | OtakuNation",
        html,
        text: `You requested a password reset. Click this link to set a new password: ${resetLink} \nThis link will expire in 1 hour.`
    });
};

module.exports = {
    sendEmail,
    sendOrderConfirmationEmail,
    sendNewsletterWelcomeEmail,
    sendPasswordResetEmail
};
