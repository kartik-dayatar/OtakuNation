const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// ── Address Sub-document ─────────────────────────────────
// Translates SQL: addresses table (embedded, max ~5 per user)
const addressSchema = new mongoose.Schema({
    recipientName: { type: String, required: true, trim: true },
    addressLine1:  { type: String, required: true, trim: true },
    addressLine2:  { type: String, default: "",    trim: true },
    city:          { type: String, required: true, trim: true },
    state:         { type: String, required: true, trim: true },
    postalCode:    { type: String, required: true, trim: true },
    country:       { type: String, default: "India" },
    phone:         { type: String, default: "" },
    isDefault:     { type: Boolean, default: false },
});

// ── Cart Item Sub-document ────────────────────────────────
// Translates SQL: cart_items table (embedded, cleared on checkout)
const cartItemSchema = new mongoose.Schema({
    product:   { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    sizeLabel: { type: String, default: null },  // null for non-clothing
    quantity:  { type: Number, required: true, min: 1, default: 1 },
    addedAt:   { type: Date, default: Date.now },
});

// ── User Schema ──────────────────────────────────────────
const userSchema = new mongoose.Schema(
    {
        // Core Identity
        firstName:       { type: String, required: true, trim: true },
        lastName:        { type: String, required: true, trim: true },
        email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
        password:        { type: String, required: true, minlength: 8 },
        phone:           { type: String, default: "" },
        profileImageUrl: { type: String, default: null },

        // Access Control (SQL: role ENUM + is_active)
        role: {
            type:    String,
            enum:    ["customer", "admin"],
            default: "customer",
        },
        isActive:    { type: Boolean, default: true },
        lastLoginAt: { type: Date,    default: null },

        // Profile extras shown on Account page
        gender:   { type: String, enum: ["MALE", "FEMALE", "OTHER", ""], default: "" },
        dob:      { type: String, default: "" },    // "YYYY-MM-DD"
        hintName: { type: String, default: "" },    // nickname / account label

        // Loyalty points
        otakuPoints: { type: Number, default: 0 },

        // SQL: addresses → embedded array
        addresses: [addressSchema],

        // SQL: wishlists → array of Product refs
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

        // SQL: cart_items → embedded array
        cart: [cartItemSchema],
    },
    { timestamps: true }
);

// ── Hash password before save ────────────────────────────
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt    = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare plain-text password ──────────────────────────
userSchema.methods.matchPassword = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

// ── Virtual: full name ───────────────────────────────────
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.index({ role:  1 });

module.exports = mongoose.model("User", userSchema);
