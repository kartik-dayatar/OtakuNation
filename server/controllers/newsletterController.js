const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400);
            throw new Error("Email is required");
        }

        // Check if already subscribed
        const existing = await Newsletter.findOne({ email: email.toLowerCase() });
        if (existing) {
            // If already subscribed, return success but don't create new
            return res.status(200).json({
                success: true,
                message: "You are already subscribed to our newsletter!"
            });
        }

        await Newsletter.create({
            email: email.toLowerCase(),
            subscribedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Successfully subscribed to the newsletter!"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    subscribe
};
