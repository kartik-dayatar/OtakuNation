const SiteSetting = require("../models/SiteSetting");

// GET /api/settings
// If ?key=hero_slides is provided, returns just that setting. Otherwise, returns all.
const getSettings = async (req, res, next) => {
    try {
        const { key } = req.query;
        if (key) {
            const setting = await SiteSetting.findOne({ key });
            return res.json(setting || null);
        }

        const settings = await SiteSetting.find();
        
        // Convert array of [{key: "...", value: "..."}] to an object { key: value, ... }
        // Attempt to JSON.parse the values where applicable.
        const settingsMap = {};
        for (const s of settings) {
            try {
                // E.g. "hero_slides" is stored as stringified JSON
                settingsMap[s.key] = JSON.parse(s.value);
            } catch (e) {
                // Flat string
                settingsMap[s.key] = s.value;
            }
        }
        
        res.json(settingsMap);
    } catch (err) {
        next(err);
    }
};

module.exports = { getSettings };
