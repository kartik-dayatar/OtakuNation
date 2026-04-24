const mongoose = require("mongoose");

// Translates SQL: coupons table
const couponSchema = new mongoose.Schema(
    {
        code: {
            type:     String,
            required: true,
            unique:   true,
            uppercase: true,
            trim:     true,
        },
        type: {
            type:     String,
            enum:     ["percent", "flat"],
            required: true,
        },
        value:          { type: Number, required: true },           // % or ₹ amount
        minOrderAmount: { type: Number, default: 0 },
        maxUses:        { type: Number, default: null },            // null = unlimited
        usesCount:      { type: Number, default: 0 },
        isActive:       { type: Boolean, default: true },
        validFrom:      { type: Date,   default: null },
        validUntil:     { type: Date,   default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
