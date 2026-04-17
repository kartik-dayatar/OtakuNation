const express = require("express");
const router  = express.Router();

const {
    register,
    login,
    adminLogin,
    getProfile,
    updateProfile,
    addAddress,
    deleteAddress,
    getAllUsers,
    getCustomerById,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart,
    getWishlist,
    toggleWishlist,
    deleteUser,
} = require("../controllers/userController");


const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── Public ────────────────────────────────────────────
router.post("/register",      register);
router.post("/login",         login);
router.post("/admin/login",   adminLogin);

// ── Protected (any logged-in user) ───────────────────
router.get("/profile",           protect, getProfile);
router.put("/profile",           protect, updateProfile);
router.post("/addresses",        protect, addAddress);
router.delete("/addresses/:addrId", protect, deleteAddress);

// ── Admin only ────────────────────────────────────────
router.get("/",     protect, adminOnly, getAllUsers);
router.get("/:id",  protect, adminOnly, getCustomerById);
router.delete("/:id", protect, adminOnly, deleteUser);

// ── Cart (requires login) ─────────────────────────────
router.get("/cart",            protect, getCart);
router.post("/cart",           protect, addToCart);
router.post("/cart/sync",      protect, syncCart);          // login-time merge
router.put("/cart/:itemId",    protect, updateCartItem);
router.delete("/cart/:itemId", protect, removeFromCart);
router.delete("/cart",         protect, clearCart);

// ── Wishlist (requires login) ─────────────────────────
router.get("/wishlist",           protect, getWishlist);
router.post("/wishlist/toggle",   protect, toggleWishlist);

module.exports = router;
