const mongoose = require("mongoose");

// Translates SQL: categories table
// has_size_option drives whether the UI shows a size selector
const categorySchema = new mongoose.Schema(
    {
        name:          { type: String, required: true, trim: true },
        slug:          { type: String, required: true, unique: true, lowercase: true, trim: true },
        iconEmoji:     { type: String, default: "🏷️" },
        hasSizeOption: { type: Boolean, default: false }, // true for Clothing
        displayOrder:  { type: Number,  default: 0 },
        isActive:      { type: Boolean, default: true },
        subCategories: [{ type: String, trim: true }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
