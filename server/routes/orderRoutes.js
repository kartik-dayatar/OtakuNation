const express = require("express");
const router  = express.Router();

const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    validatePromo,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── All order routes require login ────────────────────
router.use(protect);

// User routes
router.post("/",                  createOrder);
router.post("/validate-promo",    validatePromo);   // validate coupon/giftcard before checkout
router.get("/mine",               getMyOrders);
router.get("/:id",                getOrderById);
router.put("/:id/cancel",         cancelOrder);

// Admin routes
router.get("/",                   adminOnly, getAllOrders);
router.put("/:id/status",         adminOnly, updateOrderStatus);

module.exports = router;

