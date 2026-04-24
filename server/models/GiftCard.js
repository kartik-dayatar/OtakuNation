const mongoose = require("mongoose");

// Translates SQL: gift_cards + gift_card_usages tables
// Usages are embedded (bounded — one entry per user who redeems)

// ── Gift Card Usage Sub-document ────────────────────────
const giftCardUsageSchema = new mongoose.Schema({
    usedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
    order:   { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    usedAt:  { type: Date, default: Date.now },
});

// ── Gift Card Schema ─────────────────────────────────────
const giftCardSchema = new mongoose.Schema(
    {
        code: {
            type:     String,
            required: true,
            unique:   true,
            uppercase: true,
            trim:     true,
        },
        name:         { type: String,  required: true },          // e.g. 'Starter Gift Card'
        denomination: { type: Number,  required: true },          // ₹500, ₹1000, ₹2000…
        isActive:     { type: Boolean, default: true },
        expiresAt:    { type: Date,    default: null },
        createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        // SQL: gift_card_usages → embedded (prevents same user redeeming twice)
        usages: [giftCardUsageSchema],
    },
    { timestamps: true }
);

giftCardSchema.index({ isActive: 1 });

module.exports = mongoose.model("GiftCard", giftCardSchema);
