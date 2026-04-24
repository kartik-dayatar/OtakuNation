const mongoose = require("mongoose");

// Translates SQL: refunds table
const refundSchema = new mongoose.Schema(
    {
        order: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "Order",
            required: true,
        },
        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
        },
        amount: {
            type:     Number,
            required: true,
            min:      0,
        },
        reason: {
            type:    String,
            default: "",
            trim:    true,
        },
        status: {
            type:    String,
            enum:    ["requested", "approved", "rejected", "completed"],
            default: "requested",
        },
        adminNote: {
            type:    String,
            default: "",    // admin can add a reason for rejection/approval
        },
        resolvedAt: {
            type:    Date,
            default: null,
        },
    },
    { timestamps: true }
);

refundSchema.index({ order:  1 });
refundSchema.index({ user:   1 });
refundSchema.index({ status: 1 });

module.exports = mongoose.model("Refund", refundSchema);
