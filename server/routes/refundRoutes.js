const express = require("express");
const router  = express.Router();

const {
    requestRefund,
    getMyRefunds,
    getAllRefunds,
    updateRefundStatus,
    getRefundById,
} = require("../controllers/refundController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── All refund routes require login ───────────────────
router.use(protect);

// ── User routes ───────────────────────────────────────
router.post("/",          requestRefund);   // submit a refund request
router.get("/mine",       getMyRefunds);    // list own refunds

// ── Admin routes ──────────────────────────────────────
router.get("/",           adminOnly, getAllRefunds);             // list all refunds
router.put("/:id/status", adminOnly, updateRefundStatus);       // approve / reject / complete

// ── Shared — owner or admin ───────────────────────────
router.get("/:id",        getRefundById);    // view a single refund

module.exports = router;
