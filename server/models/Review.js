const mongoose = require("mongoose");

// Translates SQL: reviews table
// Kept as a separate collection (not embedded in Product) to prevent
// documents hitting MongoDB's 16MB BSON limit on popular products.
// A post-save hook updates Product.ratingAvg and Product.reviewCount.

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "Product",
            required: true,
        },
        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
        },

        rating:  { type: Number, required: true, min: 1, max: 5 },
        title:   { type: String, default: "",   trim: true },
        body:    { type: String, required: true, trim: true },

        // Only true when the user has an Order containing this product
        isVerifiedPurchase: { type: Boolean, default: false },

        // Admin moderation flag
        isApproved: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// ── One review per user per product ─────────────────────
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1 });

// ── Update Product stats after a review is saved ─────────
reviewSchema.post("save", async function () {
    const Product = mongoose.model("Product");
    const stats   = await mongoose.model("Review").aggregate([
        { $match: { product: this.product, isApproved: true } },
        { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
        await Product.findByIdAndUpdate(this.product, {
            ratingAvg:   Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    }
});

// ── Update Product stats after a review is deleted ───────
reviewSchema.post("findOneAndDelete", async function (doc) {
    if (!doc) return;
    const Product = mongoose.model("Product");
    const stats   = await mongoose.model("Review").aggregate([
        { $match: { product: doc.product, isApproved: true } },
        { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await Product.findByIdAndUpdate(doc.product, {
        ratingAvg:   stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
        reviewCount: stats.length > 0 ? stats[0].count : 0,
    });
});

module.exports = mongoose.model("Review", reviewSchema);
