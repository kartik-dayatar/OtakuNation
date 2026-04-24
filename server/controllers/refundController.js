const Refund = require("../models/Refund");
const Order  = require("../models/Order");

// ────────────────────────────────────────────────────
// POST /api/refunds   (protected — user)
// Body: { orderId, amount, reason }
// User can only request a refund on their own delivered/cancelled orders
// ────────────────────────────────────────────────────
const requestRefund = async (req, res, next) => {
    try {
        const { orderId, amount, reason } = req.body;

        if (!orderId || !amount) {
            res.status(400);
            throw new Error("orderId and amount are required");
        }

        const order = await Order.findById(orderId);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        // Ownership check
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("Not authorised to request a refund for this order");
        }

        // Only allow refund on delivered or cancelled orders
        if (!["delivered", "cancelled", "returned"].includes(order.status)) {
            res.status(400);
            throw new Error(
                `Refunds can only be requested for delivered, cancelled, or returned orders. Current status: "${order.status}"`
            );
        }

        // Prevent duplicate open refund requests for same order
        const existing = await Refund.findOne({
            order:  orderId,
            status: { $in: ["requested", "approved"] },
        });
        if (existing) {
            res.status(400);
            throw new Error("A refund request for this order is already pending or approved");
        }

        // Amount cannot exceed order total
        if (Number(amount) > order.totalAmount) {
            res.status(400);
            throw new Error(`Refund amount cannot exceed the order total of ₹${order.totalAmount}`);
        }

        const refund = await Refund.create({
            order:  orderId,
            user:   req.user._id,
            amount: Number(amount),
            reason: reason || "",
        });

        res.status(201).json(refund);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/refunds/mine   (protected — user)
// Returns all refunds for the logged-in user
// ────────────────────────────────────────────────────
const getMyRefunds = async (req, res, next) => {
    try {
        const refunds = await Refund.find({ user: req.user._id })
            .populate("order", "orderNumber totalAmount status createdAt")
            .sort({ createdAt: -1 });
        res.json(refunds);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/refunds   (admin)
// Query: ?status=requested|approved|rejected|completed&page=1&limit=20
// ────────────────────────────────────────────────────
const getAllRefunds = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = status ? { status } : {};

        const total   = await Refund.countDocuments(filter);
        const refunds = await Refund.find(filter)
            .populate("order", "orderNumber totalAmount status")
            .populate("user",  "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ refunds, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// PUT /api/refunds/:id/status   (admin)
// Body: { status: "approved"|"rejected"|"completed", adminNote? }
// ────────────────────────────────────────────────────
const updateRefundStatus = async (req, res, next) => {
    try {
        const { status, adminNote } = req.body;
        const VALID = ["approved", "rejected", "completed"];

        if (!VALID.includes(status)) {
            res.status(400);
            throw new Error(`status must be one of: ${VALID.join(", ")}`);
        }

        const refund = await Refund.findById(req.params.id);
        if (!refund) {
            res.status(404);
            throw new Error("Refund not found");
        }

        // Guard against backwards transitions
        if (refund.status === "completed") {
            res.status(400);
            throw new Error("A completed refund cannot be changed");
        }

        refund.status    = status;
        refund.adminNote = adminNote || refund.adminNote;

        if (["approved", "rejected", "completed"].includes(status)) {
            refund.resolvedAt = new Date();
        }

        // If completed, mark the parent order payment as refunded
        if (status === "completed") {
            await Order.findByIdAndUpdate(refund.order, {
                paymentStatus: "refunded",
                $push: {
                    statusHistory: {
                        status: "returned",
                        note:   `Refund of ₹${refund.amount} completed`,
                    },
                },
            });
        }

        const updated = await refund.save();
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/refunds/:id   (protected)
// Users can only view their own; admins can view any
// ────────────────────────────────────────────────────
const getRefundById = async (req, res, next) => {
    try {
        const refund = await Refund.findById(req.params.id)
            .populate("order", "orderNumber totalAmount status")
            .populate("user",  "firstName lastName email");

        if (!refund) {
            res.status(404);
            throw new Error("Refund not found");
        }

        if (
            refund.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            res.status(403);
            throw new Error("Access denied");
        }

        res.json(refund);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    requestRefund,
    getMyRefunds,
    getAllRefunds,
    updateRefundStatus,
    getRefundById,
};
