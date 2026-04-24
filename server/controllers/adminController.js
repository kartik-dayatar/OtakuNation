const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const SiteSetting = require("../models/SiteSetting");

// ────────────────────────────────────────────────────
// GET /api/admin/stats
// Provides comprehensive real-time aggregated data
// ────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();

        // ── Month boundaries ──────────────────────────────
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        // ── Week boundaries (last 7 days) ─────────────────
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        // ── Year start for monthly trend ──────────────────
        const yearStart = new Date(now.getFullYear(), 0, 1);

        // ── Active order statuses ─────────────────────────
        const activeStatuses = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"];

        // ── 1. Overall totals ─────────────────────────────
        const [overallAgg] = await Order.aggregate([
            { $group: {
                _id: null,
                totalRevenue:  { $sum: { $cond: [{ $in: ["$status", activeStatuses] }, "$totalAmount", 0] } },
                totalOrders:   { $sum: 1 },
                pendingOrders: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } }
            }}
        ]);
        const overall = overallAgg || { totalRevenue: 0, totalOrders: 0, pendingOrders: 0 };

        // ── 2. This month revenue ─────────────────────────
        const [thisMonthAgg] = await Order.aggregate([
            { $match: { createdAt: { $gte: thisMonthStart }, status: { $in: activeStatuses } } },
            { $group: { _id: null, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } }
        ]);
        const thisMonth = thisMonthAgg || { revenue: 0, orders: 0 };

        // ── 3. Last month revenue ─────────────────────────
        const [lastMonthAgg] = await Order.aggregate([
            { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }, status: { $in: activeStatuses } } },
            { $group: { _id: null, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } }
        ]);
        const lastMonth = lastMonthAgg || { revenue: 0, orders: 0 };

        // Growth % vs last month (revenue-based)
        let growthPercent = 0;
        if (lastMonth.revenue > 0) {
            growthPercent = ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100;
        } else if (thisMonth.revenue > 0) {
            growthPercent = 100; // First-ever revenue month
        }

        // ── 4. Order status breakdown (for doughnut) ─────
        const statusBreakdown = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const statusMap = {};
        statusBreakdown.forEach(s => { statusMap[s._id] = s.count; });

        // ── 5. Daily revenue — last 7 days (for weekly chart) ──
        const weeklyRaw = await Order.aggregate([
            { $match: { createdAt: { $gte: weekStart }, status: { $in: activeStatuses } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders:  { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Build a full 7-day array with 0 fill for missing days
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const found = weeklyRaw.find(r => r._id === key);
            weeklyData.push({
                day: d.toLocaleDateString("en-US", { weekday: "short" }),
                date: key,
                revenue: found ? found.revenue : 0,
                orders:  found ? found.orders  : 0
            });
        }

        // ── 6. Monthly revenue trend — current year ────────
        const monthlyRaw = await Order.aggregate([
            { $match: { createdAt: { $gte: yearStart }, status: { $in: activeStatuses } } },
            { $group: {
                _id: { $month: "$createdAt" },
                revenue: { $sum: "$totalAmount" },
                orders:  { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const found = monthlyRaw.find(r => r._id === i + 1);
            const monthName = new Date(now.getFullYear(), i, 1)
                .toLocaleDateString("en-US", { month: "short" });
            return { month: monthName, revenue: found ? found.revenue : 0, orders: found ? found.orders : 0 };
        });

        // ── 7. Today stats ────────────────────────────────
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const [todayAgg] = await Order.aggregate([
            { $match: { createdAt: { $gte: todayStart }, status: { $in: activeStatuses } } },
            { $group: { _id: null, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } }
        ]);
        const todayStats = todayAgg || { revenue: 0, orders: 0 };

        // ── 8. Customers ──────────────────────────────────
        const customerCount = await User.countDocuments({ role: "customer" });

        // ── 9. Low stock items ────────────────────────────
        const lowStockCount = await Product.countDocuments({
            status: "active",
            $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
        });

        // ── 10. Top selling products (from order items) ───
        const topSellingRaw = await Order.aggregate([
            { $match: { status: { $in: activeStatuses } } },
            { $unwind: "$items" },
            { $group: {
                _id:           "$items.product",
                totalQty:      { $sum: "$items.quantity" },
                totalRevenue:  { $sum: "$items.lineTotal" },
                productName:   { $first: "$items.productName" },
                productImage:  { $first: "$items.productImage" }
            }},
            { $sort: { totalQty: -1 } },
            { $limit: 5 }
        ]);

        // Enrich with live product price
        const topSelling = await Promise.all(topSellingRaw.map(async (item) => {
            let price = 0;
            if (item._id) {
                const prod = await Product.findById(item._id).select("price").lean();
                price = prod ? prod.price : 0;
            }
            return {
                productId:   item._id,
                productName: item.productName,
                productImage: item.productImage,
                totalQty:    item.totalQty,
                totalRevenue: item.totalRevenue,
                price
            };
        }));

        res.json({
            // Core stats
            revenue:       overall.totalRevenue,
            orders:        overall.totalOrders,
            pendingOrders: overall.pendingOrders,
            customers:     customerCount,
            lowStockItems: lowStockCount,

            // Growth
            growthPercent:         parseFloat(growthPercent.toFixed(2)),
            thisMonthRevenue:      thisMonth.revenue,
            lastMonthRevenue:      lastMonth.revenue,
            thisMonthOrders:       thisMonth.orders,

            // Today
            todayRevenue: todayStats.revenue,
            todayOrders:  todayStats.orders,

            // Charts
            statusBreakdown,
            weeklyData,
            monthlyData,

            // Products
            topSelling
        });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/admin/settings
// ────────────────────────────────────────────────────
const getSettings = async (req, res, next) => {
    try {
        const settingsRaw = await SiteSetting.find({});
        // Convert array to Key-Value config object mapped to frontend state map
        const settings = {};
        for (const item of settingsRaw) {
            settings[item.key] = item.value;
        }

        // Default mappings so frontend doesn't break
        const mappedSettings = {
            storeName: settings["site_name"] || 'OtakuNation',
            contactEmail: settings["support_email"] || 'support@otakunation.com',
            phone: settings["phone"] || '+91 999 999 9999',
            currency: settings["currency"] || 'INR',
            taxRate: settings["tax_rate"] || '18',
            theme: settings["theme"] || 'System',
            enableReviews: settings["enable_reviews"] === 'true' || true,
            maintenanceMode: settings["maintenance_mode"] === 'true' || false,
        };

        res.json(mappedSettings);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// PUT /api/admin/settings
// ────────────────────────────────────────────────────
const updateSettings = async (req, res, next) => {
    try {
        const updates = req.body;
        
        // Reverse map from frontend obj to DB key-value
        const mapToDB = {
            storeName: "site_name",
            contactEmail: "support_email",
            phone: "phone",
            currency: "currency",
            taxRate: "tax_rate",
            theme: "theme",
            enableReviews: "enable_reviews",
            maintenanceMode: "maintenance_mode"
        };

        for (const [key, value] of Object.entries(updates)) {
            const dbKey = mapToDB[key];
            if (dbKey) {
                // Ensure booleans are casted back to strings for KV store
                await SiteSetting.findOneAndUpdate(
                    { key: dbKey },
                    { value: String(value) },
                    { upsert: true, new: true }
                );
            }
        }

        res.json({ message: "Settings updated successfully" });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/admin/cleanup-users   (admin)
// Body: { action: "deactivate" | "delete", inactiveWeeks: number }
// Finds customers who have not logged in within inactiveWeeks AND
// have placed zero orders in that window, then deactivates or deletes them.
// ────────────────────────────────────────────────────
const cleanupInactiveUsers = async (req, res, next) => {
    try {
        const { action = "deactivate", inactiveWeeks = 10 } = req.body;

        if (![ "deactivate", "delete" ].includes(action)) {
            res.status(400);
            throw new Error('action must be "deactivate" or "delete"');
        }

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - Number(inactiveWeeks) * 7);

        // Find customers whose lastLoginAt is before the cutoff (or never logged in)
        const inactiveUsers = await User.find({
            role:     "customer",
            isActive: action === "deactivate" ? true : { $in: [true, false] },
            $or: [
                { lastLoginAt: { $lt: cutoff } },
                { lastLoginAt: null },
            ],
        }).select("_id email createdAt lastLoginAt");

        if (inactiveUsers.length === 0) {
            return res.json({ affected: 0, action, message: "No inactive users found" });
        }

        const userIds = inactiveUsers.map((u) => u._id);

        // Cross-check: exclude users who have active/recent orders
        const recentOrderUserIds = await Order.distinct("user", {
            user:      { $in: userIds },
            createdAt: { $gte: cutoff },
        });

        const recentSet = new Set(recentOrderUserIds.map(String));
        const eligibleIds = userIds.filter((id) => !recentSet.has(String(id)));

        if (eligibleIds.length === 0) {
            return res.json({
                affected: 0,
                action,
                message: "All inactive users have recent orders — none changed",
            });
        }

        let affected = 0;
        if (action === "deactivate") {
            const result = await User.updateMany(
                { _id: { $in: eligibleIds } },
                { $set: { isActive: false } }
            );
            affected = result.modifiedCount;
        } else {
            const result = await User.deleteMany({ _id: { $in: eligibleIds } });
            affected = result.deletedCount;
        }

        res.json({
            affected,
            action,
            inactiveWeeks: Number(inactiveWeeks),
            message: `${affected} user(s) ${action === "deactivate" ? "deactivated" : "deleted"} successfully`,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboardStats,
    getSettings,
    updateSettings,
    cleanupInactiveUsers,
};
