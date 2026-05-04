require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const animeSeriesRoutes = require("./routes/animeSeriesRoutes");
const refundRoutes = require("./routes/refundRoutes");
const articleRoutes = require("./routes/articleRoutes");
const siteSettingRoutes = require("./routes/siteSettingRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const contactRoutes = require("./routes/contactRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { initCronJobs } = require("./utils/cronJobs");

// ── Register all Mongoose models at startup ──────────────
// Required so cross-model hooks (e.g. Review → Product) resolve correctly
require("./models/User");
require("./models/Category");
require("./models/AnimeSeries");
require("./models/Product");
require("./models/Order");
require("./models/Review");
require("./models/Coupon");
require("./models/GiftCard");
require("./models/SiteSetting");
require("./models/Article");
require("./models/Newsletter");
require("./models/Refund");

// ── Connect to MongoDB ───────────────────────────────
connectDB();

const app = express();

// ── Core Middleware ──────────────────────────────────
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve Static Uploads ──────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ── Debug Request Logger (remove in production) ──────
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        const originalSend = res.json.bind(res);
        res.json = function (data) {
            if (res.statusCode >= 400) {
                console.log(`[${req.method}] ${req.originalUrl} → ${res.statusCode}`, data?.message || '');
            }
            return originalSend(data);
        };
        next();
    });
}

// ── Health Check ─────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Otaku Nation API is running \uD83C\uDF8C" });
});

// ── API Routes ───────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/series", animeSeriesRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/settings", siteSettingRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

// ── Error Handling ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    
    // Initialize automated tasks
    initCronJobs();
});