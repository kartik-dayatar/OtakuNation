const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

// ── ROUTE 1: GET /api/reviews/can-review/:productId ───────
const checkCanReview = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // Find any order belonging to user that is delivered and contains this product
        const order = await Order.findOne({
            user: userId,
            status: "delivered",
            "items.product": productId
        });

        if (!order) {
            return res.json({ canReview: false, reason: "no_purchase" });
        }

        // Check if already reviewed for this specific product in THIS order
        const existingReview = await Review.findOne({
            user: userId,
            product: productId,
            order: order._id
        });

        if (existingReview) {
            return res.json({ canReview: false, reason: "already_reviewed" });
        }

        res.json({ canReview: true, orderId: order._id });
    } catch (err) {
        next(err);
    }
};

// ── ROUTE 2: POST /api/reviews ─────────────────────────────
const createReview = async (req, res, next) => {
    try {
        const { productId, orderId, rating, title, body } = req.body;
        const userId = req.user._id;

        // 1. Verification checks
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            res.status(404);
            throw new Error("Order not found or not owned by user");
        }

        if (order.status !== "delivered") {
            res.status(400);
            throw new Error("You can only review products from delivered orders");
        }

        const hasProduct = order.items.some(item => item.product.toString() === productId);
        if (!hasProduct) {
            res.status(400);
            throw new Error("Product not found in this order");
        }

        const existingReview = await Review.findOne({
            user: userId,
            product: productId,
            order: orderId
        });
        if (existingReview) {
            res.status(400);
            throw new Error("You have already reviewed this product for this order");
        }

        // 2. Create Review
        const review = await Review.create({
            user: userId,
            product: productId,
            order: orderId,
            rating: Number(rating),
            title: title || "",
            body: body,
            verifiedPurchase: true
        });

        // The post-save hook in Review.js handles product aggregation

        res.status(201).json(review);
    } catch (err) {
        next(err);
    }
};

// ── ROUTE 3: GET /api/reviews/product/:productId ──────────
const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ product: productId, isApproved: true })
            .populate("user", "firstName lastName")
            .sort({ createdAt: -1 });

        const count = reviews.length;
        const avgRating = count > 0 
            ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / count) * 10) / 10 
            : 0;

        res.json({
            count,
            avgRating,
            reviews
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    checkCanReview,
    createReview,
    getProductReviews
};
