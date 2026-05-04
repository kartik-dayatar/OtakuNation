const express = require("express");
const router  = express.Router();

const {
    register,
    login,
    adminLogin,
    verifyEmail,
    forgotPassword,
    verifyOTP,
    resetPassword,
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
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
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password",    forgotPassword);
router.post("/verify-otp",         verifyOTP);
router.post("/reset-password",      resetPassword);

// ── Protected (any logged-in user) ───────────────────
router.get("/profile",           protect, getProfile);
router.put("/profile",           protect, updateProfile);
router.post("/addresses",        protect, addAddress);
router.put("/addresses/:addrId", protect, updateAddress);
router.delete("/addresses/:addrId", protect, deleteAddress);
router.patch("/addresses/:addrId/default", protect, setDefaultAddress);

// ── Cart (requires login) ─────────────────────────────
// MUST be above /:id wildcard route or Express will match
// "cart", "wishlist" etc. as the :id param (admin route).
router.get("/cart",            protect, getCart);
router.post("/cart/sync",      protect, syncCart);
router.post("/cart",           protect, addToCart);
router.put("/cart/:itemId",    protect, updateCartItem);
router.delete("/cart/:itemId", protect, removeFromCart);
router.delete("/cart",         protect, clearCart);

// ── Wishlist (requires login) ─────────────────────────
// Also must be above /:id wildcard.
router.get("/wishlist",           protect, getWishlist);
router.post("/wishlist/toggle",   protect, toggleWishlist);

// ── Admin only ────────────────────────────────────────
// /:id wildcard MUST come last — it matches any path segment
// and would swallow /cart, /wishlist, /profile etc. if placed first.
router.get("/",     protect, adminOnly, getAllUsers);
router.get("/:id",  protect, adminOnly, getCustomerById);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
