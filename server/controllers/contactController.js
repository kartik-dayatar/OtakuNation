const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/emailService');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res, next) => {
    try {
        const { fullName, email, message } = req.body;

        if (!fullName || !email || !message) {
            res.status(400);
            throw new Error("Please provide all fields");
        }

        const contact = await Contact.create({
            fullName,
            email,
            message
        });

        // Send Email Notification to Admin
        const adminEmailHtml = `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
                <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">New Contact Message</h2>
                <p><strong>From:</strong> ${fullName} (${email})</p>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <p style="margin: 0;"><strong>Message:</strong></p>
                    <p style="margin: 10px 0 0; line-height: 1.6;">${message}</p>
                </div>
                <p style="font-size: 0.8rem; color: #9ca3af;">Received at: ${new Date().toLocaleString()}</p>
            </div>
        `;

        sendEmail({
            to: process.env.ADMIN_EMAIL || 'admin@otakunation.com',
            subject: `New Contact Form Submission from ${fullName}`,
            html: adminEmailHtml,
            text: `New contact from ${fullName} (${email}): ${message}`
        });

        // Optional: Send auto-reply to user
        const userReplyHtml = `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; text-align: center; padding: 30px;">
                <h1 style="color: #ef4444;">Message Received!</h1>
                <p>Hi ${fullName}, thank you for reaching out to <strong>OtakuNation</strong>.</p>
                <p>We've received your message and our team will get back to you as soon as possible (usually within 24-48 hours).</p>
                <p style="margin-top: 30px; font-style: italic;">Stay awesome!</p>
                <p>&mdash; The OtakuNation Team</p>
            </div>
        `;

        sendEmail({
            to: email,
            subject: "We've received your message! | OtakuNation",
            html: userReplyHtml,
            text: `Hi ${fullName}, we've received your message and will get back to you soon.`
        });

        res.status(201).json({
            success: true,
            message: "Your message has been sent successfully!"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitContactForm
};
