const mongoose = require("mongoose");

// ── Product Image Sub-document ────────────────────────────
// Translates SQL: product_images table (embedded, typically 4-6 per product)
const productImageSchema = new mongoose.Schema({
    url:          { type: String, required: true },    // filename, e.g. 'Haori.jpg'
    altText:      { type: String, default: "" },
    isPrimary:    { type: Boolean, default: false },   // main card thumbnail
    displayOrder: { type: Number,  default: 0 },
});

// ── Product Size Sub-document ─────────────────────────────
// Translates SQL: product_sizes table (stock tracked per size)
const productSizeSchema = new mongoose.Schema({
    sizeLabel:     { type: String, required: true },  // 'S','M','L','XL','XXL','Free Size'
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    displayOrder:  { type: Number, default: 0 },
});

// ── Product Schema ───────────────────────────────────────
const productSchema = new mongoose.Schema(
    {
        // Basic
        name:             { type: String, required: true, trim: true },
        slug:             { type: String, required: true, unique: true, lowercase: true, trim: true },
        sku:              { type: String, required: true, unique: true, uppercase: true, trim: true },
        brand:            { type: String, default: "OtakuNation", trim: true },

        // Content
        description:      { type: String, required: true },
        shortDescription: { type: String, default: "" },

        // Categorization  — references Category & AnimeSeries collections
        category:         { type: mongoose.Schema.Types.ObjectId, ref: "Category",    required: true },
        subcategory:      { type: String, default: "" },
        animeSeries:      { type: mongoose.Schema.Types.ObjectId, ref: "AnimeSeries", default: null },

        // SQL: product_tags → embedded string array
        tags: [{ type: String, trim: true }],

        // Pricing (stored in INR)
        price:            { type: Number, required: true, min: 0 },
        comparePrice:     { type: Number, default: null },   // crossed-out "was" price
        costPrice:        { type: Number, default: null },   // admin-only cost of goods

        // Inventory & Logistics
        // For products WITHOUT sizes: stockQuantity tracks total stock
        // For products WITH  sizes:  stockQuantity is sum of productSizes[].stockQuantity
        stockQuantity:    { type: Number, required: true, default: 0, min: 0 },
        lowStockThreshold:{ type: Number, default: 5 },
        weightGrams:      { type: Number, default: null },
        dimensions:       { type: String, default: null },   // 'L x W x H cm'
        material:         { type: String, default: null },

        // SQL: product_sizes → embedded array (only populated when category.hasSizeOption = true)
        sizes: [productSizeSchema],

        // Visibility & Badges
        status: {
            type:    String,
            enum:    ["active", "draft", "archived"],
            default: "draft",
        },
        isFeatured:    { type: Boolean, default: false },
        isNewArrival:  { type: Boolean, default: false },
        isBestSeller:  { type: Boolean, default: false },
        badgeLabel:    { type: String,  default: null },    // e.g. 'New', 'Premium'

        // SQL: product_images → embedded array
        images: [productImageSchema],

        // Cached stats — updated by Review post-save hook
        ratingAvg:    { type: Number, default: 0, min: 0, max: 5 },
        reviewCount:  { type: Number, default: 0, min: 0 },

        // SEO
        metaTitle:       { type: String, default: null },
        metaDescription: { type: String, default: null },
    },
    { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────
productSchema.index({ status:      1 });
productSchema.index({ category:    1 });
productSchema.index({ animeSeries: 1 });
productSchema.index({ isFeatured:  1 });
productSchema.index({ isNewArrival:1 });
productSchema.index({ name: "text", description: "text", shortDescription: "text" });

module.exports = mongoose.model("Product", productSchema);
