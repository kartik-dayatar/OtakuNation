const mongoose = require("mongoose");

// Translates SQL: site_settings table (key/value store)
// Single-document pattern — only one settings document will ever exist.
// Access via: SiteSetting.findOne({}) or SiteSetting.findOne({ key: '...' })

const siteSettingSchema = new mongoose.Schema(
    {
        key:   { type: String, required: true, unique: true, trim: true },
        value: { type: String, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SiteSetting", siteSettingSchema);
