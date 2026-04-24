/**
 * Seeder — populates MongoDB with:
 *   • All category documents (required before products due to ObjectId ref)
 *   • All 25 products with correct slugs, SKUs, and category refs
 *   • A default admin user
 *
 * Usage:
 *   node seed/seeder.js            → seed (insert)
 *   node seed/seeder.js --destroy  → wipe all data
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");

const Product     = require("../models/Product");
const User        = require("../models/User");
const Order       = require("../models/Order");
const Category    = require("../models/Category");
const AnimeSeries = require("../models/AnimeSeries");
const Review      = require("../models/Review");

// ── Helper: make a URL-safe slug ─────────────────────────
const slugify = (str) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ── Helper: make a SKU from name + index ─────────────────
const makeSKU = (name, idx) =>
    `ON-${name.replace(/\s+/g, "-").toUpperCase().slice(0, 8)}-${String(idx).padStart(3, "0")}`;

// ── Category seed data ────────────────────────────────────
const categoryData = [
    { name: "Figures",        slug: "figures",        hasSizeOption: false, description: "Premium anime figures and statues" },
    { name: "Apparel",        slug: "apparel",        hasSizeOption: true,  description: "Anime-inspired clothing" },
    { name: "Accessories",    slug: "accessories",    hasSizeOption: false, description: "Keychains, jewelry and more" },
    { name: "Home Decor",     slug: "home-decor",     hasSizeOption: false, description: "Posters, rugs and room items" },
    { name: "Manga",          slug: "manga",          hasSizeOption: false, description: "Manga volumes and box sets" },
    { name: "Footwear",       slug: "footwear",       hasSizeOption: true,  description: "Anime-themed shoes and sneakers" },
    { name: "Ukiyo District", slug: "ukiyo-district", hasSizeOption: false, description: "Traditional Japanese fashion" },
];

// ── Raw product data (mirrors client/src/data/products.js) ─
const rawProducts = [
    { legacyId: 1,  name: "Gojo Figure",            price: 15770, comparePrice: 20750, category: "figures",        subCategory: "Premium PVC",    rating: 4.9, numReviews: 284, badge: "Best Seller",        inStock: true, stock: 50,  images: ["gojo-figure.jpg", "gojo-poster.jpg"],                               sizes: ["Standard","Deluxe","Collector"], description: "Highly detailed 1/7 scale figure of Gojo Satoru from Jujutsu Kaisen. Features his iconic blindfold and Domain Expansion pose. Made with premium PVC material and hand-painted details." },
    { legacyId: 2,  name: "AOT Jacket",             price:  6640, comparePrice: null,  category: "apparel",        subCategory: "Jackets",        rating: 4.7, numReviews: 156, badge: null,                 inStock: true, stock: 80,  images: ["AOT-jackate.jpg", "levi-poster.jpg"],                                sizes: ["S","M","L","XL","XXL"],          description: "Premium quality Scout Regiment jacket featuring the Wings of Freedom emblem. Made from high-quality polyester blend with detailed embroidery." },
    { legacyId: 3,  name: "Zoro Action Figure",     price: 12450, comparePrice: 16600, category: "figures",        subCategory: "Premium PVC",    rating: 4.9, numReviews: 512, badge: "Best Seller",        inStock: true, stock: 30,  images: ["zoro-action-figure(p0).png", "one-piece-wantedposter.png"],          sizes: ["Standard","Limited Edition"],    description: "A masterpiece capturing Roronoa Zoro in his signature Santoryu (Three Sword Style) stance. Premium figure with incredible detail." },
    { legacyId: 4,  name: "Naruto Action Figure",   price: 10790, comparePrice: null,  category: "figures",        subCategory: "Premium PVC",    rating: 4.6, numReviews: 198, badge: "New Arrival",        inStock: true, stock: 45,  images: ["naruto-actionfigure.jpg", "naruto-headband.jpg"],                   sizes: ["Standard","Deluxe"],            description: "Dynamic Naruto figure in Sage Mode with Rasengan effect. 1/8 scale, premium PVC with high level of detailing." },
    { legacyId: 5,  name: "One Piece Wanted Poster",price:  2905, comparePrice:  3735, category: "home-decor",     subCategory: "Wall Art",       rating: 4.5, numReviews:  89, badge: null,                 inStock: true, stock: 200, images: ["one-piece-wantedposter.png", "poster.jpg"],                          sizes: ["Set of 10"],                    description: "Premium One Piece wanted poster set. Authentic bounty designs from the series on high-quality parchment paper." },
    { legacyId: 6,  name: "Anya Plush",             price:  2490, comparePrice: null,  category: "accessories",    subCategory: "Plushies",       rating: 4.9, numReviews: 367, badge: "Fan Favorite",       inStock: true, stock: 120, images: ["anya-plush.jpg", "anya.jpg", "spyxfamily.jpg"],                     sizes: ["Small","Medium"],               description: "Adorable Anya Forger plushie with her iconic shocked expression. Super soft polyester filling, 30cm tall." },
    { legacyId: 7,  name: "Deku Jacket",            price:  5395, comparePrice: null,  category: "apparel",        subCategory: "Hoodies",        rating: 4.4, numReviews: 123, badge: null,                 inStock: true, stock: 65,  images: ["deku-jackate.jpg", "deku.jpg"],                                      sizes: ["S","M","L","XL"],               description: "My Hero Academia Deku-inspired hoodie jacket. High-quality fabric with embroidered details." },
    { legacyId: 8,  name: "Pochita Keychain",       price:  1245, comparePrice:  1660, category: "accessories",    subCategory: "Keychains",      rating: 4.7, numReviews: 245, badge: null,                 inStock: true, stock: 300, images: ["pochita-keychain.jpg"],                                              sizes: ["One Size"],                     description: "Adorable Pochita keychain from Chainsaw Man. Perfect for your keys or backpack." },
    { legacyId: 9,  name: "Vegeta Figure",          price: 13280, comparePrice: null,  category: "figures",        subCategory: "Premium PVC",    rating: 4.8, numReviews: 176, badge: "Exclusive",          inStock: true, stock: 25,  images: ["vagita-figure.jpg"],                                                 sizes: ["Standard","Deluxe"],            description: "Highly detailed Vegeta figure in his battle stance. Features high-quality paint application and dynamic pose." },
    { legacyId: 10, name: "Tokyo Ghoul Keychain",   price:  1079, comparePrice: null,  category: "accessories",    subCategory: "Keychains",      rating: 4.3, numReviews:  78, badge: null,                 inStock: true, stock: 250, images: ["tokyo-ghoul-keychain.jpg"],                                          sizes: ["One Size"],                     description: "Premium enamel keychain featuring Tokyo Ghoul icons. Durable metal with vibrant enamel colors." },
    { legacyId: 11, name: "JJK Manga",              price: 11620, comparePrice: 14940, category: "manga",          subCategory: "Box Sets",       rating: 4.9, numReviews: 443, badge: "Hot Deal",           inStock: true, stock: 60,  images: ["JJK-manga.jpg"],                                                    sizes: ["English"],                      description: "Complete Jujutsu Kaisen manga collection. Experience the dark fantasy world of Curses and Jujutsu Sorcerers." },
    { legacyId: 12, name: "Poster",                 price:  4150, comparePrice: null,  category: "home-decor",     subCategory: "Wall Art",       rating: 4.6, numReviews:  67, badge: null,                 inStock: true, stock: 150, images: ["poster.jpg"],                                                        sizes: ["Medium","Large"],               description: "Vibrant anime art poster printed on high-quality matte paper. Perfect for your room decor." },
    { legacyId: 13, name: "Tanjiro Sneakers",       price:  7470, comparePrice:  9960, category: "footwear",       subCategory: "Sneakers",       rating: 4.7, numReviews:  56, badge: "New",               inStock: true, stock: 40,  images: ["tanjiro-sneakers.jpg"],                                              sizes: ["US 8","US 9","US 10","US 11"],   description: "Premium sneakers featuring Tanjiro's signature checkered pattern. Comfortable and stylish for daily wear." },
    { legacyId: 14, name: "Akatsuki Rug",           price:  3818, comparePrice: null,  category: "home-decor",     subCategory: "Rugs",           rating: 4.8, numReviews: 112, badge: null,                 inStock: true, stock: 35,  images: ["akatski-rug.jpg"],                                                   sizes: ["100cm","150cm"],                description: "Soft and durable room rug with the iconic Akatsuki cloud symbol. Elevate your room aesthetic." },
    { legacyId: 15, name: "Haori",                  price:  5395, comparePrice:  7055, category: "ukiyo-district", subCategory: "Haori",          rating: 5.0, numReviews:  24, badge: "Exclusive",          inStock: true, stock: 20,  images: ["Haori.jpg", "demon-slayer_hori.jpg"],                                sizes: ["One Size"],                     description: "Authentic Japanese Haori with traditional patterns. Perfect for cosplay or casual wear." },
    { legacyId: 16, name: "Luffy Gear5 Action Figure",price:16600,comparePrice: 20750, category: "figures",        subCategory: "Premium PVC",    rating: 5.0, numReviews: 120, badge: "Collector's Edition", inStock: true, stock: 15,  images: ["luffy-gear5-action-figure.png"],                                     sizes: ["Standard","Collector","Deluxe"], description: "The ultimate Luffy Gear 5 transformation figure. Dynamic pose with incredible smoke and lightning effects." },
    { legacyId: 17, name: "Sukuna Finger Replica",  price:  4150, comparePrice: null,  category: "accessories",    subCategory: "Replicas",       rating: 4.9, numReviews:  85, badge: "Limited",            inStock: true, stock: 50,  images: ["sukuna-fingure-replica.jpg"],                                        sizes: ["One Size"],                     description: "Lifelike replica of Ryomen Sukuna's cursed finger. Comes in a traditional wooden box." },
    { legacyId: 18, name: "Tanjiro Earrings",       price:  1660, comparePrice: null,  category: "accessories",    subCategory: "Jewelry",        rating: 4.8, numReviews: 150, badge: null,                 inStock: true, stock: 180, images: ["tanjiro-earings.jpg"],                                               sizes: ["One Size"],                     description: "Official replica of Tanjiro's Hanafuda earrings. Lightweight and nickel-free." },
    { legacyId: 19, name: "Luffy Gear 5 Tee",       price:  2490, comparePrice:  3320, category: "apparel",        subCategory: "T-Shirts",       rating: 4.7, numReviews: 210, badge: "Trending",           inStock: true, stock: 100, images: ["luffy-G5-tee.jpg"],                                                  sizes: ["S","M","L","XL","XXL"],          description: "High-quality graphic tee featuring Luffy's Gear 5 transformation. 100% premium cotton." },
    { legacyId: 20, name: "Yuji Jacket",            price:  5810, comparePrice: null,  category: "apparel",        subCategory: "Hoodies",        rating: 4.6, numReviews:  95, badge: null,                 inStock: true, stock: 75,  images: ["yuji-jackate.jpg"],                                                  sizes: ["S","M","L","XL"],               description: "Yuji Itadori inspired hoodie jacket from Jujutsu Kaisen. Features the red hood design." },
    { legacyId: 21, name: "Luffy Hat",              price:  2075, comparePrice:  2905, category: "accessories",    subCategory: "Cosplay",        rating: 4.9, numReviews: 320, badge: "Popular",            inStock: true, stock: 90,  images: ["luffy-hat.jpg"],                                                     sizes: ["One Size"],                     description: "The iconic straw hat worn by Monkey D. Luffy. High-quality straw weave with the signature red ribbon." },
    { legacyId: 22, name: "Zenitsu",                price: 11205, comparePrice: 14110, category: "figures",        subCategory: "Premium PVC",    rating: 4.8, numReviews: 145, badge: "Trending",           inStock: true, stock: 28,  images: ["zenitsu.jpg"],                                                       sizes: ["Standard","Deluxe"],            description: "Dynamic figure of Zenitsu Agatsuma performing Thunder Breathing First Form. Features translucent lightning effects." },
    { legacyId: 23, name: "One Piece Keychain",     price:   830, comparePrice: null,  category: "accessories",    subCategory: "Keychains",      rating: 4.5, numReviews:  64, badge: null,                 inStock: true, stock: 400, images: ["one-piece-keychain.png"],                                            sizes: ["One Size"],                     description: "Premium enamel keychain featuring One Piece pirate symbols. Durable metal with vibrant finish." },
    { legacyId: 24, name: "Katana",                 price:  9960, comparePrice: 12450, category: "accessories",    subCategory: "Replicas",       rating: 4.9, numReviews:  88, badge: "Exclusive",          inStock: true, stock: 18,  images: ["katana.jpg"],                                                        sizes: ["Full Size"],                    description: "Full-sized metal replica of Tanjiro Kamado's black Nichirin sword. High carbon steel (unsharpened) with accurate tsuba design." },
    { legacyId: 25, name: "Hashira Statue",         price: 24900, comparePrice: null,  category: "figures",        subCategory: "Resin Statues",  rating: 5.0, numReviews:  42, badge: "Limited Edition",    inStock: true, stock: 8,   images: ["hashira-statchu.jpg"],                                               sizes: ["Large"],                        description: "Breathtaking resin statue featuring all nine Hashira. A centerpiece for any serious collector." },
    { legacyId: 26, name: "One Piece Live Action Poster",price:  3735, comparePrice: null,  category: "home-decor",     subCategory: "Wall Art",       rating: 4.8, numReviews:  45, badge: "New Arrival",        inStock: true, stock: 100, images: ["OP-liveaction.jpg"],                                                sizes: ["Medium","Large"],               description: "Official One Piece Live Action series poster featuring the Straw Hat crew. Premium print quality." },
    { legacyId: 27, name: "Otaku Mashup Poster",      price:  4150, comparePrice: null,  category: "home-decor",     subCategory: "Wall Art",       rating: 4.9, numReviews:  32, badge: "Exclusive",          inStock: true, stock: 50,  images: ["combined.jpg"],                                                     sizes: ["Large"],                        description: "Exclusive Otaku Nation mashup poster featuring iconic characters from multiple anime series." },
    { legacyId: 28, name: "Levi Ackerman Premium Poster",price:  2905, comparePrice: null,  category: "home-decor",     subCategory: "Wall Art",       rating: 4.7, numReviews:  18, badge: null,                 inStock: true, stock: 150, images: ["levi-poster.jpg"],                                                   sizes: ["Small","Medium"],               description: "Highly detailed Levi Ackerman art poster. Perfect for any Attack on Titan fan." },
    { legacyId: 29, name: "Gojo Satoru Limited Art",  price:  3320, comparePrice: null,  category: "home-decor",     subCategory: "Wall Art",       rating: 5.0, numReviews:  12, badge: "Limited",            inStock: true, stock: 30,  images: ["gojo-poster.jpg"],                                                  sizes: ["Medium"],                       description: "Limited edition Gojo Satoru art print with high-quality finish and vibrant colors." },
    { legacyId: 30, name: "Hidden Leaf Headband",     price:  1245, comparePrice: null,  category: "accessories",    subCategory: "Cosplay",        rating: 4.6, numReviews:  210, badge: "Best Seller",        inStock: true, stock: 300, images: ["naruto-headband.jpg"],                                              sizes: ["One Size"],                     description: "Official Naruto Hidden Leaf Village headband. Authentic metal plate on durable fabric." },
];

// ─────────────────────────────────────────────────────────
const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        // ── Destroy mode ─────────────────────────────────
        if (process.argv[2] === "--destroy") {
            await Promise.all([
                Product.deleteMany({}),
                User.deleteMany({}),
                Order.deleteMany({}),
                Category.deleteMany({}),
                AnimeSeries.deleteMany({}),
            ]);
            console.log("🗑️  All data wiped");
            process.exit(0);
        }

        // ── 1. Seed Categories ────────────────────────────
        await Category.deleteMany({});
        const insertedCategories = await Category.insertMany(categoryData);
        console.log(`✅ Seeded ${insertedCategories.length} categories`);

        // Build a lookup map: slug → ObjectId
        const catMap = {};
        insertedCategories.forEach((c) => { catMap[c.slug] = c._id; });

        // ── 2. Seed Products ──────────────────────────────
        await Product.deleteMany({});

        const productDocs = rawProducts.map((p, idx) => {
            const catId = catMap[p.category];
            if (!catId) throw new Error(`Category not found for slug: ${p.category}`);

            // Build images array (DB format)
            const imagesArr = p.images.map((filename, i) => ({
                url:          filename,
                altText:      p.name,
                isPrimary:    i === 0,
                displayOrder: i,
            }));

            return {
                legacyId:      p.legacyId,
                name:          p.name,
                slug:          slugify(p.name),
                sku:           makeSKU(p.name, p.legacyId),
                description:   p.description,
                category:      catId,
                subcategory:   p.subCategory || "",
                price:         p.price,
                comparePrice:  p.comparePrice || null,
                stockQuantity: p.stock,
                images:        imagesArr,
                status:        "active",
                isBestSeller:  p.badge === "Best Seller",
                isNewArrival:  p.badge === "New Arrival",
                isFeatured:    ["Best Seller", "Exclusive", "Collector's Edition"].includes(p.badge),
                badgeLabel:    p.badge || null,
                ratingAvg:     p.rating,
                reviewCount:   p.numReviews,
                // Flat sizes array (the schema stores sizes as sub-docs with sizeLabel + stockQuantity)
                sizes: (p.sizes || []).map((sizeLabel, si) => ({
                    sizeLabel,
                    stockQuantity: Math.floor(p.stock / (p.sizes.length || 1)),
                    displayOrder:  si,
                })),
            };
        });

        await Product.insertMany(productDocs);
        console.log(`✅ Seeded ${productDocs.length} products`);

        // ── 3. Seed Admin user ────────────────────────────
        const adminExists = await User.findOne({ email: "admin@otakunation.com" });
        if (!adminExists) {
            await User.create({
                firstName: "Admin",
                lastName:  "OtakuNation",
                email:     "admin@otakunation.com",
                password:  "Admin@1234",
                role:      "admin",
            });
            console.log("✅ Admin created  →  admin@otakunation.com / Admin@1234");
        } else {
            console.log("ℹ️  Admin already exists – skipped");
        }

        // ── 4. Seed Reviews ───────────────────────────────
        console.log("✍️ SEEDING REVIEWS...");
        await Review.deleteMany({});
        const admin = await User.findOne({ email: "admin@otakunation.com" });
        const allProducts = await Product.find({});
        
        const reviewData = [];
        // Just add 1 real review for each product to show they are real
        allProducts.forEach((prod, i) => {
            reviewData.push({
                product: prod._id,
                user:    admin._id,
                rating:  prod.ratingAvg || 5,
                title:   "Excellent!",
                body:    `The ${prod.name} is absolutely amazing. Highly recommended!`,
                isApproved: true,
                isVerifiedPurchase: true,
            });
        });
        await Review.insertMany(reviewData);
        console.log(`✅ Seeded ${reviewData.length} real reviews`);

        console.log("\n🎉 Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeder error:", err.message);
        process.exit(1);
    }
};

seed();
