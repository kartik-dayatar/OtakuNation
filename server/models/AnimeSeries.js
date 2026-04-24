const mongoose = require("mongoose");

// Translates SQL: anime_series table
// Used for product filtering by franchise & home-page series carousel
const animeSeriesSchema = new mongoose.Schema(
    {
        name:         { type: String, required: true, trim: true },
        slug:         { type: String, required: true, unique: true, lowercase: true, trim: true },
        thumbnailUrl: { type: String, default: null },    // e.g. thumbnails/JJK.jpg
        gradientFrom: { type: String, default: "#2563eb" }, // CSS hex for card gradient
        gradientTo:   { type: String, default: "#1d4ed8" },
        displayOrder: { type: Number,  default: 0 },
        isActive:     { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AnimeSeries", animeSeriesSchema);
