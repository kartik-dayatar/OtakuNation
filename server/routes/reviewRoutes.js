const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
    checkCanReview, 
    createReview, 
    getProductReviews 
} = require("../controllers/reviewController");

router.get("/can-review/:productId", protect, checkCanReview);
router.post("/", protect, createReview);
router.get("/product/:productId", getProductReviews);

module.exports = router;
