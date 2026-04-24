const mongoose = require("mongoose");

// ── Order Item Sub-document ───────────────────────────────
// Translates SQL: order_items table
// Values are snapshots so catalogue changes don't affect order history
const orderItemSchema = new mongoose.Schema({
    product:      { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    productName:  { type: String, required: true },          // snapshot
    productImage: { type: String, default: null },           // filename snapshot
    sizeLabel:    { type: String, default: null },
    unitPrice:    { type: Number, required: true },          // price at purchase
    quantity:     { type: Number, required: true, min: 1 },
    lineTotal:    { type: Number, required: true },          // unitPrice × quantity
});

// ── Shipping Address Snapshot ─────────────────────────────
// Copied at order time so the user can update their address book later
const shippingSnapshotSchema = new mongoose.Schema({
    recipientName: { type: String, required: true },
    addressLine1:  { type: String, required: true },
    addressLine2:  { type: String, default: "" },
    city:          { type: String, required: true },
    state:         { type: String, required: true },
    postalCode:    { type: String, required: true },
    country:       { type: String, default: "India" },
    phone:         { type: String, default: "" },
});

// ── Status History Entry ──────────────────────────────────
// Translates SQL: order_status_history table (audit trail)
const statusHistorySchema = new mongoose.Schema({
    status:    { type: String, required: true },
    note:      { type: String, default: "" },
    changedAt: { type: Date,   default: Date.now },
});

// ── Order Schema ─────────────────────────────────────────
const orderSchema = new mongoose.Schema(
    {
        // Human-readable unique number e.g. "ORD-2026-0001"
        orderNumber: { type: String, unique: true },

        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
        },

        // Embedded items & address snapshots
        items:           [orderItemSchema],
        shippingAddress: shippingSnapshotSchema,

        // Financials (all in INR)
        subtotal:       { type: Number, required: true },
        shippingAmount: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        totalAmount:    { type: Number, required: true },

        // Coupon snapshot (reference stays but code is stored for history)
        coupon:      { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
        couponCode:  { type: String, default: null },

        // Payment
        paymentMethod: {
            type:    String,
            enum:    ["COD", "UPI", "Card", "NetBanking", "Wallet", "GiftCard"],
            default: "COD",
        },
        paymentStatus: {
            type:    String,
            enum:    ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        paymentReference:   { type: String, default: null },  // gateway tx ID
        razorpayPaymentId:  { type: String, default: null },

        // Fulfilment lifecycle
        status: {
            type:    String,
            enum:    ["confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
            default: "confirmed",
        },
        trackingId:        { type: String, default: null },
        estimatedDelivery: { type: Date,   default: null },
        deliveredAt:       { type: Date,   default: null },
        notes:             { type: String, default: "" },

        // Embedded audit trail
        statusHistory: [statusHistorySchema],
    },
    { timestamps: true }
);

// ── Auto-generate order number before insert ─────────────
orderSchema.pre("save", async function () {
    if (!this.isNew) return;
    const count = await mongoose.model("Order").countDocuments();
    const year  = new Date().getFullYear();
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(4, "0")}`;
    // Seed initial status event
    this.statusHistory.push({ status: "confirmed", note: "Order placed successfully" });
});

// ── Indexes ──────────────────────────────────────────────
orderSchema.index({ user:        1, createdAt: -1 });
orderSchema.index({ status:      1 });
orderSchema.index({ createdAt:   -1 });

module.exports = mongoose.model("Order", orderSchema);
