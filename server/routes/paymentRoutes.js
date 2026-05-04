const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, paymentFailed } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/failed", protect, paymentFailed);

module.exports = router;
