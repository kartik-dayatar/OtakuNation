const Product = require("../models/Product");
const Category = require("../models/Category");
const AnimeSeries = require("../models/AnimeSeries");
const Review = require("../models/Review");

// ────────────────────────────────────────────────────
// GET /api/products
// Query params: category, search, sort, page, limit
// ────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
    try {
        const { category, anime, search, sort, status, adminView, page = 1, limit = 50 } = req.query;

        let filter = {};

        // For standard users, only show active. Admins can see more via adminView param.
        if (adminView === 'true') {
            filter = {}; // Show all initially
        } else {
            filter.status = 'active';
        }

        // Apply Status filtering
        if (status && status !== 'all') {
            if (status === 'out_of_stock') {
                filter.stockQuantity = 0;
            } else {
                filter.status = status;
            }
        }

        if (category && category !== "all") {
            // Category is stored as ObjectId ref, so look up Category by slug first
            const categoryDoc = await Category.findOne({ slug: category.toLowerCase() });
            if (categoryDoc) {
                filter.category = categoryDoc._id;
            } else {
                // No category found — return empty results rather than all products
                filter.category = null;
            }
        }

        if (anime && anime !== "all") {
            const seriesDoc = await AnimeSeries.findOne({ slug: anime.toLowerCase() });
            if (seriesDoc) {
                filter.animeSeries = seriesDoc._id;
            } else {
                filter.animeSeries = null;
            }
        }

        if (search) {
            // Expand search to include Categories and Anime Series
            const matchingCategories = await Category.find({ name: { $regex: search, $options: "i" } }).select('_id');
            const matchingSeries = await AnimeSeries.find({ name: { $regex: search, $options: "i" } }).select('_id');

            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $in: matchingCategories.map(c => c._id) } },
                { animeSeries: { $in: matchingSeries.map(s => s._id) } }
            ];
        }

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            price_high: { price: -1 },
            price_low: { price: 1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            stock_low: { stockQuantity: 1 },
            stock_high: { stockQuantity: -1 },
            rating: { ratingAvg: -1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 },
        };
        const sortOption = sortMap[sort] || { createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product.countDocuments(filter);
        const productsRaw = await Product.find(filter)
            .populate("category", "name slug hasSizeOption")
            .populate("animeSeries", "name slug")
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const products = productsRaw.map(p => {
            const primaryImg = p.images?.find(img => img.isPrimary) || p.images?.[0];

            // Helper to ensure path is correct for frontend
            const resolveImgPath = (url) => {
                if (!url) return null;
                if (url.startsWith('http') || url.startsWith('/src') || url.startsWith('/assets') || url.startsWith('data:')) return url;
                return `http://localhost:5000/uploads/products/${url}`;
            };

            return {
                ...p.toObject(),
                id: p._id,
                category: p.category ? p.category.slug : 'uncategorized',
                categoryName: p.category ? p.category.name : 'Uncategorized',
                animeSeries: p.animeSeries ? p.animeSeries.slug : null,
                animeSeriesName: p.animeSeries ? p.animeSeries.name : null,
                image: resolveImgPath(primaryImg?.url),
                images: p.images?.map(img => resolveImgPath(img.url)) || [],
                badge: p.badgeLabel,
                inStock: p.stockQuantity > 0,
                stock: p.stockQuantity,
                reviews: p.reviewCount,
                rating: p.ratingAvg,
                sizes: p.sizes?.map(s => s.sizeLabel) || [],
            };
        });

        res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/products/:id
// ────────────────────────────────────────────────────
const getProductById = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id)
            .populate("category")
            .populate("animeSeries");

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        // Helper to ensure path is correct for frontend
        const resolveImgPath = (url) => {
            if (!url) return null;
            if (url.startsWith('http') || url.startsWith('/src') || url.startsWith('/assets') || url.startsWith('data:')) return url;
            return `http://localhost:5000/uploads/products/${url}`;
        };

        const mappedProduct = {
            ...product.toObject(),
            id: product._id,
            category: product.category ? product.category.slug : 'uncategorized',
            categoryName: product.category ? product.category.name : 'Uncategorized',
            animeSeries: product.animeSeries ? product.animeSeries.slug : null,
            animeSeriesName: product.animeSeries ? product.animeSeries.name : null,
            image: resolveImgPath(product.images?.[0]?.url),
            images: product.images?.map(img => resolveImgPath(img.url)) || [],
            badge: product.badgeLabel,
            inStock: product.stockQuantity > 0,
            stock: product.stockQuantity,
            reviews: product.reviewCount,
            rating: product.ratingAvg,
            sizes: product.sizes?.map(s => s.sizeLabel) || [],
        };

        res.json(mappedProduct);
    } catch (err) {
        next(err);
    }
};


// ────────────────────────────────────────────────────
// POST /api/products   (admin)
// ────────────────────────────────────────────────────
const createProduct = async (req, res, next) => {
    try {
        let payload = { ...req.body };

        // Convert UI category string (slug) to ObjectId
        if (payload.category && typeof payload.category === "string") {
            const cat = await Category.findOne({ slug: payload.category.toLowerCase() });
            if (cat) payload.category = cat._id;
        }

        // Convert UI animeSeries string to ObjectId (if it exists)
        if (payload.animeSeries && typeof payload.animeSeries === "string") {
            const seriesSlug = payload.animeSeries.toLowerCase().replace(/\s+/g, '-');
            const series = await AnimeSeries.findOne({ slug: seriesSlug });
            if (series) payload.animeSeries = series._id;
        }

        // Handle Tags (sent as JSON string in FormData)
        if (payload.tags && typeof payload.tags === "string") {
            try {
                payload.tags = JSON.parse(payload.tags);
            } catch (e) {
                payload.tags = payload.tags.split(',').map(t => t.trim());
            }
        }

        // Handle File Upload or UI flat image string
        if (req.file) {
            payload.images = [{ url: req.file.filename, isPrimary: true }];
        } else if (payload.image && typeof payload.image === "string" && !payload.images) {
            payload.images = [{ url: payload.image, isPrimary: true }];
            delete payload.image;
        }

        // Convert inStock boolean and flat stock integer to stockQuantity
        if (payload.stock !== undefined) {
            payload.stockQuantity = Number(payload.stock);
        }

        const product = await Product.create(payload);
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// PUT /api/products/:id   (admin)
// ────────────────────────────────────────────────────
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        let updates = { ...req.body };

        if (updates.category && typeof updates.category === "string") {
            const cat = await Category.findOne({ slug: updates.category.toLowerCase() });
            if (cat) updates.category = cat._id;
        }

        if (updates.animeSeries && typeof updates.animeSeries === "string") {
            const seriesSlug = updates.animeSeries.toLowerCase().replace(/\s+/g, '-');
            const series = await AnimeSeries.findOne({ slug: seriesSlug });
            if (series) updates.animeSeries = series._id;
        }

        // Handle Tags
        if (updates.tags && typeof updates.tags === "string") {
            try {
                updates.tags = JSON.parse(updates.tags);
            } catch (e) {
                updates.tags = updates.tags.split(',').map(t => t.trim());
            }
        }

        if (req.file) {
            updates.images = [{ url: req.file.filename, isPrimary: true }];
        } else if (updates.image && typeof updates.image === "string") {
            updates.images = [{ url: updates.image, isPrimary: true }];
            delete updates.image;
        }

        if (updates.stock !== undefined) {
            updates.stockQuantity = Number(updates.stock);
        }

        // Convert booleans from strings (FormData)
        if (updates.isFeatured === 'true') updates.isFeatured = true;
        if (updates.isFeatured === 'false') updates.isFeatured = false;
        if (updates.isNewArrival === 'true') updates.isNewArrival = true;
        if (updates.isNewArrival === 'false') updates.isNewArrival = false;
        if (updates.isBestSeller === 'true') updates.isBestSeller = true;
        if (updates.isBestSeller === 'false') updates.isBestSeller = false;
        if (updates.inStock === 'true') updates.inStock = true;
        if (updates.inStock === 'false') updates.inStock = false;

        Object.assign(product, updates);
        const updated = await product.save();
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// DELETE /api/products/:id   (admin)
// ────────────────────────────────────────────────────
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        await product.deleteOne();
        res.json({ message: "Product deleted" });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/products/:id/reviews   (protected user)
// ────────────────────────────────────────────────────
const addReview = async (req, res, next) => {
    try {
        const { rating, title, body } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        // Check if user already reviewed this product
        const alreadyReviewed = await Review.findOne({
            product: req.params.id,
            user: req.user._id,
        });

        if (alreadyReviewed) {
            res.status(400);
            throw new Error("Product already reviewed");
        }

        const review = await Review.create({
            product: req.params.id,
            user: req.user._id,
            rating: Number(rating),
            title: title || "",
            body: body,
            isApproved: true, // Auto-approve for now
        });

        res.status(201).json({ message: "Review added successfully", review });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview };
