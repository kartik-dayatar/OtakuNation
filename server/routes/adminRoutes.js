const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
    getDashboardStats,
    getSettings,
    updateSettings,
    cleanupInactiveUsers,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/stats",           protect, adminOnly, getDashboardStats);
router.get("/settings",        protect, adminOnly, getSettings);
router.put("/settings",        protect, adminOnly, updateSettings);
router.post("/cleanup-users",  protect, adminOnly, cleanupInactiveUsers);

module.exports = router;

