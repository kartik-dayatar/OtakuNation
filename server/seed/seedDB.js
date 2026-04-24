/**
 * seedDB.js — OtakuNation Essential Data Seeder
 *
 * Seeds ONLY the minimum required data to run the project:
 *   • 1 Admin user
 *   • 1 Test customer
 *   • 9 Categories  (matching database.sql)
 *   • 10 Anime Series (matching database.sql)
 *   • 3 Products with full detail (images, sizes, tags)
 *   • 2 Active Coupons
 *   • 1 Gift Card
 *   • Core Site Settings
 *   • 2 Sample Articles (1 news, 1 blog)
 *
 * Usage:
 *   npm run seed          ← wipe + seed
 *   npm run seed:destroy  ← wipe only
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose    = require("mongoose");
const connectDB   = require("../config/db");

// ── Models ───────────────────────────────────────────────
const User        = require("../models/User");
const Category    = require("../models/Category");
const AnimeSeries = require("../models/AnimeSeries");
const Product     = require("../models/Product");
const Order       = require("../models/Order");
const Review      = require("../models/Review");
const Coupon      = require("../models/Coupon");
const GiftCard    = require("../models/GiftCard");
const SiteSetting = require("../models/SiteSetting");
const Article     = require("../models/Article");
const Newsletter  = require("../models/Newsletter");

// ────────────────────────────────────────────────────────
// SEED DATA
// ────────────────────────────────────────────────────────

// ── Categories (matches SQL categories table) ─────────
const categoriesData = [
    { name: "Clothing",     slug: "clothing",     iconEmoji: "👕", hasSizeOption: true,  displayOrder: 1 },
    { name: "Figures",      slug: "figures",      iconEmoji: "🗿", hasSizeOption: false, displayOrder: 2 },
    { name: "Accessories",  slug: "accessories",  iconEmoji: "🎒", hasSizeOption: false, displayOrder: 3 },
    { name: "Posters",      slug: "posters",      iconEmoji: "🖼️", hasSizeOption: false, displayOrder: 4 },
    { name: "Collectibles", slug: "collectibles", iconEmoji: "⭐", hasSizeOption: false, displayOrder: 5 },
    { name: "Manga",        slug: "manga",        iconEmoji: "📚", hasSizeOption: false, displayOrder: 6 },
    { name: "Plushies",     slug: "plushies",     iconEmoji: "🧸", hasSizeOption: false, displayOrder: 7 },
    { name: "Stationery",   slug: "stationery",   iconEmoji: "✏️", hasSizeOption: false, displayOrder: 8 },
    { name: "Home & Decor", slug: "home-decor",   iconEmoji: "🏠", hasSizeOption: false, displayOrder: 9 },
];

// ── Anime Series (matches SQL anime_series table) ──────
const animeSeriesData = [
    { name: "Demon Slayer",      slug: "demon-slayer",      thumbnailUrl: "thumbnails/JJK.jpg",         gradientFrom: "#ef4444", gradientTo: "#b91c1c", displayOrder: 1 },
    { name: "Jujutsu Kaisen",    slug: "jujutsu-kaisen",    thumbnailUrl: "thumbnails/JJK-S3.jpg",      gradientFrom: "#8b5cf6", gradientTo: "#6d28d9", displayOrder: 2 },
    { name: "One Piece",         slug: "one-piece",         thumbnailUrl: "thumbnails/naruto.jpg",      gradientFrom: "#f97316", gradientTo: "#dc2626", displayOrder: 3 },
    { name: "Naruto",            slug: "naruto",            thumbnailUrl: "thumbnails/naruto.jpg",      gradientFrom: "#f59e0b", gradientTo: "#ea580c", displayOrder: 4 },
    { name: "Attack on Titan",   slug: "attack-on-titan",   thumbnailUrl: "thumbnails/JJK.jpg",        gradientFrom: "#475569", gradientTo: "#1e293b", displayOrder: 5 },
    { name: "Spy x Family",      slug: "spy-x-family",      thumbnailUrl: "thumbnails/MHA.jpg",        gradientFrom: "#ec4899", gradientTo: "#be185d", displayOrder: 6 },
    { name: "Dragon Ball Z",     slug: "dragon-ball-z",     thumbnailUrl: "thumbnails/DBZ.jpg",        gradientFrom: "#eab308", gradientTo: "#f97316", displayOrder: 7 },
    { name: "My Hero Academia",  slug: "my-hero-academia",  thumbnailUrl: "thumbnails/MHA.jpg",        gradientFrom: "#22c55e", gradientTo: "#15803d", displayOrder: 8 },
    { name: "Chainsaw Man",      slug: "chainsaw-man",      thumbnailUrl: "thumbnails/chainsawman.jpg", gradientFrom: "#dc2626", gradientTo: "#7f1d1d", displayOrder: 9 },
    { name: "Dragon Ball Daima", slug: "dragon-ball-daima", thumbnailUrl: "thumbnails/DB-daima.jpg",   gradientFrom: "#f59e0b", gradientTo: "#d97706", displayOrder: 10 },
];

// ── Site Settings (matches SQL site_settings seed) ─────
const siteSettingsData = [
    { key: "site_name",           value: "OtakuNation" },
    { key: "support_email",       value: "support@otakunation.com" },
    { key: "hero_heading",        value: "Your Anime Universe, Delivered." },
    { key: "hero_subheading",     value: "Official merch for every otaku. Premium quality, pan-India delivery." },
    { key: "hero_bg_image",       value: "hero-bg.jpg" },
    { key: "free_shipping_min",   value: "5000" },
    { key: "shipping_flat_rate",  value: "99" },
    { key: "razorpay_key_id",     value: "rzp_test_DEMO_KEY_HERE" },
    { key: "announcement_bar",    value: "🎉 Free shipping on orders above ₹5000 | Use code OTAKU20 for 20% off!" },
    { key: "currency",            value: "INR" },
    { key: "tax_rate",            value: "18" },
    { key: "maintenance_mode",    value: "false" },
    { key: "enable_reviews",      value: "true" },
    { key: "theme",               value: "dark" },
    { key: "hero_slides", value: JSON.stringify([
        {
            bg: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#2563eb 100%)',
            badge: 'New Season Drop',
            title: 'Where Every Otaku Belongs',
            subtitle: 'Premium figures, apparel & collectibles from 300+ anime series. Officially licensed, globally shipped.',
            primaryBtn: { text: 'Shop Now', link: '/products' },
            secondaryBtn: { text: 'New Arrivals', link: '/new-arrivals' },
            visuals: [
                { img: '/src/assets/images/hero/demon_slayer_float.png', text: 'Demon Slayer', class: 'float-1' },
                { img: '/src/assets/images/hero/jjk_float.png', text: 'Jujutsu Kaisen', class: 'float-2' },
                { img: '/src/assets/images/hero/one_piece_float.png', text: 'One Piece', class: 'float-3' }
            ]
        },
        {
            bg: 'linear-gradient(135deg,#1a0a2e 0%,#3b1d6e 50%,#7c3aed 100%)',
            badge: 'Limited Edition',
            title: 'Exclusive Figure Collection',
            subtitle: 'Hand-painted, limited-run figures from top studios. Each piece is a masterpiece for your collection.',
            primaryBtn: { text: 'View Figures', link: '/products?category=figures' },
            secondaryBtn: { text: 'Collectibles', link: '/products?category=collectibles' },
            visuals: [
                { img: '/src/assets/images/hero/aot_float.png', text: 'Attack on Titan', class: 'float-1' },
                { img: '/src/assets/images/hero/spy_family_float.png', text: 'Spy x Family', class: 'float-2' },
                { img: '/src/assets/images/hero/mha_float.png', text: 'My Hero Academia', class: 'float-3' }
            ]
        },
        {
            bg: 'linear-gradient(135deg,#0c1220 0%,#1e293b 50%,#334155 100%)',
            badge: 'Summer Sale',
            title: 'Up to 40% Off Everything',
            subtitle: 'Biggest anime merch sale of the year. Grab your favorites before they\'re gone!',
            primaryBtn: { text: 'Shop Sale', link: '/products' },
            secondaryBtn: { text: 'Gift Cards', link: '/gift-cards' },
            visuals: [
                { img: '/src/assets/images/hero/naruto_float.png', text: 'Naruto', class: 'float-1' },
                { img: '/src/assets/images/hero/dbz_float.png', text: 'Dragon Ball Z', class: 'float-2' },
                { img: '/src/assets/images/hero/csm_float.png', text: 'Chainsaw Man', class: 'float-3' }
            ]
        }
    ])},
    { key: "stats_data", value: JSON.stringify([
        { icon: 'package', strong: '3,000+', text: 'Products' },
        { icon: 'film', strong: '300+', text: 'Anime Series' },
        { icon: 'happy', strong: '10k+', text: 'Happy Customers' },
        { icon: 'lock', strong: '100%', text: 'Secure Checkout' },
        { icon: 'check', strong: 'Authentic', text: 'Licensed Merch' }
    ])},
    { key: "why_us_data", value: JSON.stringify([
        { icon: 'quality', title: 'Premium Quality', text: 'Every item is sourced from authorized manufacturers. No bootlegs, ever.' },
        { icon: 'truck', title: 'Fast Delivery', text: 'Express shipping worldwide. Most orders ship within 24 hours of purchase.' },
        { icon: 'shield', title: 'Secure Payments', text: '256-bit SSL encryption. We support cards, UPI, wallets, and crypto.' },
        { icon: 'crown', title: 'Authentic Licensed', text: 'Officially licensed merchandise from Bandai, Good Smile, Funko & more.' }
    ])},
    { key: "testimonials", value: JSON.stringify([
        { text: '"The Demon Slayer haori I ordered is absolutely stunning. The quality exceeded my expectations. Shipping was fast too!"', author: 'Sakura M.', initial: 'S', bg: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' },
        { text: '"Best anime merch store I\'ve found. The Gojo figure is incredibly detailed. Already planning my next order!"', author: 'Riku T.', initial: 'R', bg: 'linear-gradient(135deg,#ef4444,#f97316)' },
        { text: '"Ordered the One Piece collector\'s box. Packaging was premium, items were perfect. This is THE store for anime fans."', author: 'Aiden K.', initial: 'A', bg: 'linear-gradient(135deg,#22c55e,#14b8a6)' }
    ])}
];

// ── Coupons ────────────────────────────────────────────
const couponsData = [
    {
        code:           "OTAKU20",
        type:           "percent",
        value:          20,
        minOrderAmount: 1000,
        maxUses:        500,
        isActive:       true,
        validUntil:     new Date("2026-12-31"),
    },
    {
        code:           "ANIME10",
        type:           "percent",
        value:          10,
        minOrderAmount: 500,
        maxUses:        null,
        isActive:       true,
        validUntil:     new Date("2026-12-31"),
    },
];

// ── Sample Articles ────────────────────────────────────
const articlesData = [
    {
        type:        "news",
        title:       "Jujutsu Kaisen Season 3 Official Trailer Drops",
        excerpt:     "MAPPA releases the first full-length trailer for JJK Season 3, confirming the Culling Game arc adaptation.",
        imageUrl:    "editorial/news_jjk_season3.png",
        categoryTag: "Season 3",
        isPublished: true,
        publishedAt: new Date("2026-03-10"),
    },
    {
        type:            "blog",
        title:           "Top 10 Anime Merch Picks for Spring 2026",
        excerpt:         "Spring is here and so are fresh drops. We curate the best anime merchandise arrivals this season.",
        imageUrl:        "editorial/blog_spring_merch.png",
        author:          "OtakuNation Editorial",
        readTimeMinutes: 5,
        isPublished:     true,
        publishedAt:     new Date("2026-03-15"),
    },
];

// ────────────────────────────────────────────────────────
// SEEDER FUNCTION
// ────────────────────────────────────────────────────────
const seedDatabase = async () => {
    await connectDB();

    try {
        // ── Wipe all collections ─────────────────────────
        console.log("🗑️  Clearing all collections...");
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            AnimeSeries.deleteMany({}),
            Product.deleteMany({}),
            Order.deleteMany({}),
            Review.deleteMany({}),
            Coupon.deleteMany({}),
            GiftCard.deleteMany({}),
            SiteSetting.deleteMany({}),
            Article.deleteMany({}),
            Newsletter.deleteMany({}),
        ]);
        console.log("✅  All collections cleared.");

        if (process.argv[2] === "--destroy") {
            console.log("💥  Destroy mode — exiting after wipe.");
            process.exit(0);
        }

        // ── Seed Categories ──────────────────────────────
        console.log("📂  Seeding categories...");
        const categories = await Category.insertMany(categoriesData);
        const catMap = Object.fromEntries(categories.map(c => [c.slug, c._id]));
        console.log(`✅  ${categories.length} categories inserted.`);

        // ── Seed Anime Series ────────────────────────────
        console.log("🎌  Seeding anime series...");
        const series = await AnimeSeries.insertMany(animeSeriesData);
        const seriesMap = Object.fromEntries(series.map(s => [s.slug, s._id]));
        console.log(`✅  ${series.length} anime series inserted.`);

        // ── Seed Users ───────────────────────────────────
        console.log("👤  Seeding users...");
        // Admin — password: admin123
        const adminUser = await User.create({
            firstName: "Admin",
            lastName:  "OtakuNation",
            email:     "admin@otakunation.com",
            password:  "admin1234",
            phone:     "9999999999",
            role:      "admin",
            isActive:  true,
        });

        // Test customer — password: password123
        const testCustomer = await User.create({
            firstName: "Kartik",
            lastName:  "Dayatar",
            email:     "kartik@example.com",
            password:  "password123",
            phone:     "9876543210",
            role:      "customer",
            isActive:  true,
            addresses: [
                {
                    recipientName: "Kartik Dayatar",
                    addressLine1:  "42 Anime Lane",
                    addressLine2:  "Near Konoha Park",
                    city:          "Rajkot",
                    state:         "Gujarat",
                    postalCode:    "360001",
                    phone:         "9876543210",
                    isDefault:     true,
                },
            ],
        });
        console.log(`✅  Users inserted: ${adminUser.email}, ${testCustomer.email}`);

        // ── Seed Products (3 essential items) ───────────
        console.log("🛍️  Seeding products...");
        const products = await Product.insertMany([
            {
                name:             "Demon Slayer Haori",
                slug:             "demon-slayer-haori",
                sku:              "CLO-DS-001",
                brand:            "OtakuNation",
                description:      "Channel your inner Hashira with this authentic Demon Slayer Haori. Made from high-quality breathable fabric, featuring Tanjiro's iconic green and black checkered pattern.",
                shortDescription: "Tanjiro's iconic checkered Haori — premium quality.",
                category:         catMap["clothing"],
                animeSeries:      seriesMap["demon-slayer"],
                tags:             ["anime", "demon-slayer", "haori", "cosplay", "new-arrival"],
                price:            5600,
                comparePrice:     6500,
                costPrice:        2800,
                stockQuantity:    42,
                lowStockThreshold:5,
                material:         "100% Polyester",
                status:           "active",
                isFeatured:       true,
                isNewArrival:     true,
                badgeLabel:       "New",
                ratingAvg:        4.8,
                reviewCount:      128,
                images: [
                    { url: "Haori.jpg",            altText: "Demon Slayer Haori front",    isPrimary: true,  displayOrder: 1 },
                    { url: "demon-slayer_hori.jpg", altText: "Haori pattern detail",       isPrimary: false, displayOrder: 2 },
                    { url: "zenitsu.jpg",           altText: "Haori worn view",            isPrimary: false, displayOrder: 3 },
                ],
                sizes: [
                    { sizeLabel: "S",   stockQuantity: 8,  displayOrder: 1 },
                    { sizeLabel: "M",   stockQuantity: 15, displayOrder: 2 },
                    { sizeLabel: "L",   stockQuantity: 12, displayOrder: 3 },
                    { sizeLabel: "XL",  stockQuantity: 7,  displayOrder: 4 },
                ],
            },
            {
                name:             "Gojo Satoru Figure",
                slug:             "gojo-satoru-figure",
                sku:              "FIG-JJK-001",
                brand:            "Good Smile",
                description:      "Highly detailed 1/7 scale figure of Gojo Satoru in his iconic Domain Expansion pose. Hand-painted with premium PVC and a LED illuminated base.",
                shortDescription: "1/7 scale hand-painted Gojo figure with LED base.",
                category:         catMap["figures"],
                animeSeries:      seriesMap["jujutsu-kaisen"],
                tags:             ["figure", "jujutsu-kaisen", "gojo", "premium", "limited"],
                price:            7920,
                comparePrice:     9000,
                costPrice:        4000,
                stockQuantity:    18,
                lowStockThreshold:3,
                material:         "PVC + ABS",
                status:           "active",
                isFeatured:       true,
                isNewArrival:     false,
                badgeLabel:       "Premium",
                ratingAvg:        4.9,
                reviewCount:      64,
                images: [
                    { url: "gojo-figure.jpg", altText: "Gojo Satoru Figure front",       isPrimary: true,  displayOrder: 1 },
                    { url: "gojo-poster.jpg", altText: "Gojo Figure side detail",        isPrimary: false, displayOrder: 2 },
                ],
                sizes: [],  // No size option for figures
            },
            {
                name:             "Luffy Straw Hat",
                slug:             "luffy-straw-hat",
                sku:              "ACC-OP-001",
                brand:            "OtakuNation",
                description:      "Authentic Straw Hat replica as worn by Monkey D. Luffy. Made from natural straw with a red ribbon band.",
                shortDescription: "Authentic straw hat with red band — just like Luffy's.",
                category:         catMap["accessories"],
                animeSeries:      seriesMap["one-piece"],
                tags:             ["accessories", "one-piece", "luffy", "bestseller"],
                price:            1200,
                comparePrice:     1500,
                costPrice:        500,
                stockQuantity:    95,
                lowStockThreshold:10,
                material:         "Natural Straw",
                status:           "active",
                isFeatured:       false,
                isBestSeller:     true,
                badgeLabel:       "Best Seller",
                ratingAvg:        4.6,
                reviewCount:      210,
                images: [
                    { url: "luffy-hat.jpg", altText: "Luffy Straw Hat top view", isPrimary: true, displayOrder: 1 },
                ],
                sizes: [],  // No sizes for accessories
            },
        ]);
        console.log(`✅  ${products.length} products inserted.`);

        // ── Seed Gift Card (admin created) ───────────────
        console.log("🎁  Seeding gift card...");
        await GiftCard.create({
            code:        "GIFT-A001-2026",
            name:        "Starter Gift Card",
            denomination:500,
            isActive:    true,
            expiresAt:   new Date("2027-03-22"),
            createdBy:   adminUser._id,
        });
        console.log("✅  Gift card inserted.");

        // ── Seed Coupons ─────────────────────────────────
        console.log("🏷️  Seeding coupons...");
        await Coupon.insertMany(couponsData);
        console.log(`✅  ${couponsData.length} coupons inserted.`);

        // ── Seed Site Settings ───────────────────────────
        console.log("⚙️  Seeding site settings...");
        await SiteSetting.insertMany(siteSettingsData);
        console.log(`✅  ${siteSettingsData.length} site settings inserted.`);

        // ── Seed Articles ────────────────────────────────
        console.log("📰  Seeding articles...");
        await Article.insertMany(articlesData);
        console.log(`✅  ${articlesData.length} articles inserted.`);

        // ────────────────────────────────────────────────
        console.log("\n🎌  OtakuNation database seeded successfully!\n");
        console.log("  Admin:    admin@otakunation.com  /  admin1234");
        console.log("  Customer: kartik@example.com     /  password123\n");

        process.exit(0);
    } catch (err) {
        console.error("❌ Seeder error:", err);
        process.exit(1);
    }
};

seedDatabase();
