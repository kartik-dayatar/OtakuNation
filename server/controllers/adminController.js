const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const SiteSetting = require("../models/SiteSetting");

// ────────────────────────────────────────────────────
// GET /api/admin/stats
// Provides aggregated data for the admin dashboard
// ────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
    try {
        // Aggregate total revenue and order count
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {
                            // Only count confirmed, shipped, delivered
                            $cond: [{ $in: ["$status", ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"]] }, "$totalAmount", 0]
                        }
                    },
                    totalOrders: { $sum: 1 },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
                    }
                }
            }
        ]);

        const stats = orderStats[0] || { totalRevenue: 0, totalOrders: 0, pendingOrders: 0 };
        const customerCount = await User.countDocuments({ role: "customer" });
        
        // Count low stock items by taking products where stock is <= lowStockThreshold and status is active
        const lowStockCount = await Product.countDocuments({
            status: "active",
            $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
        });

        res.json({
            revenue: stats.totalRevenue,
            orders: stats.totalOrders,
            pendingOrders: stats.pendingOrders,
            customers: customerCount,
            lowStockItems: lowStockCount
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
