const express = require("express");
const router  = express.Router();

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    addReview,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ── Public ────────────────────────────────────────────
router.get("/",    getProducts);
router.get("/:id", getProductById);

// ── Protected user ────────────────────────────────────
router.post("/:id/reviews", protect, addReview);

// ── Admin only ────────────────────────────────────────
router.post("/",       protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id",     protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id",  protect, adminOnly, deleteProduct);

module.exports = router;
