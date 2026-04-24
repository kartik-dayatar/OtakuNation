const mongoose = require("mongoose");

// Translates SQL: newsletter_subscribers table
const newsletterSchema = new mongoose.Schema(
    {
        email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
        isActive:  { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Newsletter", newsletterSchema);
