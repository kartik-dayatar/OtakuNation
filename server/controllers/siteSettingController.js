const SiteSetting = require("../models/SiteSetting");
const emailService = require("../utils/emailService");

// GET /api/settings/public-settings
// Public route — NO auth middleware, returns only UI-facing fields
const getPublicSettings = async (req, res) => {
    try {
        const allSettings = await SiteSetting.find({});

        const map = {};
        for (const s of allSettings) {
            try { map[s.key] = JSON.parse(s.value); }
            catch (e) { map[s.key] = s.value; }
        }

        res.json({
            heroSlides:   map['hero_slides']   || map['heroSlides']   || [],
            statsData:    map['stats_data']    || map['statsData']    || [],
            whyUsData:    map['why_us_data']   || map['whyUsData']   || [],
            testimonials: map['testimonials']                         || [],
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
};

// GET /api/settings
// Public route that returns only non-sensitive UI settings
const getSettings = async (req, res, next) => {
    try {
        const allSettings = await SiteSetting.find({});
        
        // Build a key → parsed value map from all DB records
        const map = {};
        for (const s of allSettings) {
            try {
                map[s.key] = JSON.parse(s.value);
            } catch (e) {
                map[s.key] = s.value;
            }
        }
        
        // Return camelCase keys (try both snake_case and camelCase DB keys)
        res.json({
            heroSlides:   map['hero_slides']   || map['heroSlides']   || [],
            statsData:    map['stats_data']    || map['statsData']    || [],
            whyUsData:    map['why_us_data']   || map['whyUsData']   || [],
            testimonials: map['testimonials']                         || [],
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/settings/contact
const submitContactForm = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            res.status(400);
            throw new Error("Name, email and message are required");
        }

        // Send email response to user
        emailService.sendContactResponse({ firstName: name, email }, { 
            subject: subject || "Your inquiry", 
            message 
        }).catch(console.error);

        res.json({ message: "Thank you for contacting us. We will get back to you soon." });
    } catch (err) {
        next(err);
    }
};

module.exports = { getPublicSettings, getSettings, submitContactForm };
