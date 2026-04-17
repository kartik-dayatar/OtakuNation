const jwt   = require("jsonwebtoken");
const User  = require("../models/User");
const Order = require("../models/Order");

// ── Helper: sign JWT ─────────────────────────────────
const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

// ── Helper: safe user object (no password) ───────────
const safeUser = (user) => ({
    _id:         user._id,
    firstName:   user.firstName,
    lastName:    user.lastName,
    fullName:    `${user.firstName} ${user.lastName}`,
    email:       user.email,
    role:        user.role,
    mobile:      user.mobile,
    gender:      user.gender,
    dob:         user.dob,
    location:    user.location,
    otakuPoints: user.otakuPoints,
    addresses:   user.addresses,
    createdAt:   user.createdAt,
});

// ────────────────────────────────────────────────────
// POST /api/users/register
// ────────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            res.status(400);
            throw new Error("All fields are required");
        }

        const exists = await User.findOne({ email });
        if (exists) {
            res.status(409);
            throw new Error("An account with this email already exists");
        }

        const user = await User.create({ firstName, lastName, email, password });
        const token = signToken(user._id);

        res.status(201).json({ token, user: safeUser(user) });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/users/login
// ────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error("Email and password are required");
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        const token = signToken(user._id);
        res.json({ token, user: safeUser(user) });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/users/admin/login   (admin-only login)
// ────────────────────────────────────────────────────
const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, role: "admin" });
        if (!user || !(await user.matchPassword(password))) {
            res.status(401);
            throw new Error("Invalid admin credentials");
        }

        const token = signToken(user._id);
        res.json({ token, user: safeUser(user) });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/users/profile    (protected)
// ────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
    try {
        res.json(safeUser(req.user));
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// PUT /api/users/profile    (protected)
// ────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        const allowed = ["firstName", "lastName", "mobile", "altMobile", "gender", "dob", "location", "hintName"];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) user[field] = req.body[field];
        });

        // Allow password change only if currentPassword matches
        if (req.body.newPassword) {
            if (!(await user.matchPassword(req.body.currentPassword))) {
                res.status(400);
                throw new Error("Current password is incorrect");
            }
            user.password = req.body.newPassword;
        }

        const updated = await user.save();
        res.json(safeUser(updated));
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/users/addresses   (protected)
// ────────────────────────────────────────────────────
const addAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const { name, street, city, state, pincode, mobile, isDefault } = req.body;

        if (isDefault) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }

        user.addresses.push({ name, street, city, state, pincode, mobile, isDefault: isDefault || user.addresses.length === 0 });
        await user.save();
        res.status(201).json(user.addresses);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// DELETE /api/users/addresses/:addrId   (protected)
// ────────────────────────────────────────────────────
const deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses = user.addresses.filter(
            (a) => a._id.toString() !== req.params.addrId
        );
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/users    (admin only)
// ────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/users/cart    (protected)
// ────────────────────────────────────────────────────
const getCart = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("cart.product", "name price comparePrice images stockQuantity sizes status badgeLabel ratingAvg reviewCount slug");

        // Filter out any cart items whose product has been deleted
        const validItems = user.cart.filter((item) => item.product !== null);
        res.json(validItems);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/users/cart    (protected) — add / increment
// Body: { productId, sizeLabel, quantity }
// ────────────────────────────────────────────────────
const addToCart = async (req, res, next) => {
    try {
        const { productId, sizeLabel = null, quantity = 1 } = req.body;

        if (!productId) {
            res.status(400);
            throw new Error("productId is required");
        }

        const user = await User.findById(req.user._id);

        const existingIdx = user.cart.findIndex(
            (item) =>
                item.product.toString() === productId &&
                item.sizeLabel === sizeLabel
        );

        if (existingIdx > -1) {
            // Increment quantity if already in cart
            user.cart[existingIdx].quantity += Number(quantity);
        } else {
            user.cart.push({ product: productId, sizeLabel, quantity: Number(quantity) });
        }

        await user.save();

        // Return populated cart
        const updated = await User.findById(req.user._id)
            .populate("cart.product", "name price comparePrice images stockQuantity sizes status badgeLabel ratingAvg reviewCount slug");
        res.json(updated.cart);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// PUT /api/users/cart/:itemId    (protected) — set exact quantity
// Body: { quantity }
// ────────────────────────────────────────────────────
const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const user = await User.findById(req.user._id);

        const item = user.cart.id(req.params.itemId);
        if (!item) {
            res.status(404);
            throw new Error("Cart item not found");
        }

        if (Number(quantity) <= 0) {
            item.deleteOne();
        } else {
            item.quantity = Number(quantity);
        }

        await user.save();

        const updated = await User.findById(req.user._id)
            .populate("cart.product", "name price comparePrice images stockQuantity sizes status badgeLabel ratingAvg reviewCount slug");
        res.json(updated.cart);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// DELETE /api/users/cart/:itemId    (protected)
// ────────────────────────────────────────────────────
const removeFromCart = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        const item = user.cart.id(req.params.itemId);
        if (!item) {
            res.status(404);
            throw new Error("Cart item not found");
        }

        item.deleteOne();
        await user.save();

        const updated = await User.findById(req.user._id)
            .populate("cart.product", "name price comparePrice images stockQuantity sizes status badgeLabel ratingAvg reviewCount slug");
        res.json(updated.cart);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// DELETE /api/users/cart    (protected) — clear entire cart
// ────────────────────────────────────────────────────
const clearCart = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
        res.json([]);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/users/cart/sync    (protected)
// Bulk-replace the DB cart with the client's local cart
// Body: { items: [{ productId, sizeLabel, quantity }] }
// ────────────────────────────────────────────────────
const syncCart = async (req, res, next) => {
    try {
        const { items = [] } = req.body;
        const user = await User.findById(req.user._id);

        // Merge: for each incoming item, add or increment in DB cart
        for (const incoming of items) {
            const existingIdx = user.cart.findIndex(
                (item) =>
                    item.product.toString() === incoming.productId &&
                    item.sizeLabel === (incoming.sizeLabel || null)
            );
            if (existingIdx > -1) {
                user.cart[existingIdx].quantity = Math.max(
                    user.cart[existingIdx].quantity,
                    incoming.quantity
                );
            } else {
                user.cart.push({
                    product:   incoming.productId,
                    sizeLabel: incoming.sizeLabel || null,
                    quantity:  incoming.quantity || 1,
                });
            }
        }

        await user.save();

        const updated = await User.findById(req.user._id)
            .populate("cart.product", "name price comparePrice images stockQuantity sizes status badgeLabel ratingAvg reviewCount slug");
        res.json(updated.cart);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/users/wishlist    (protected)
// ────────────────────────────────────────────────────
const getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("wishlist", "name price comparePrice images ratingAvg reviewCount slug badgeLabel stockQuantity status");
        res.json(user.wishlist);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/users/wishlist/toggle    (protected)
// Body: { productId }
// Returns: { wishlisted: true|false, wishlist: [...] }
// ────────────────────────────────────────────────────
const toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            res.status(400);
            throw new Error("productId is required");
        }

        const user = await User.findById(req.user._id);
        const alreadyIdx = user.wishlist.findIndex((id) => id.toString() === productId);

        let wishlisted;
        if (alreadyIdx > -1) {
            user.wishlist.splice(alreadyIdx, 1);
            wishlisted = false;
        } else {
            user.wishlist.push(productId);
            wishlisted = true;
        }

        await user.save();

        const updated = await User.findById(req.user._id)
            .populate("wishlist", "name price comparePrice images ratingAvg reviewCount slug badgeLabel stockQuantity status");
        res.json({ wishlisted, wishlist: updated.wishlist });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// GET /api/users/:id   (admin only) — read-only customer details
// ────────────────────────────────────────────────────
const getCustomerById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password -cart -wishlist");
        if (!user) {
            res.status(404);
            throw new Error("Customer not found");
        }

        // Fetch all orders placed by this customer
        const orders = await Order.find({ user: req.params.id })
            .select("orderNumber status totalAmount paymentStatus paymentMethod createdAt items shippingAddress")
            .sort({ createdAt: -1 });

        res.json({ user, orders });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// DELETE /api/users/:id   (admin only)
// ────────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        if (user.role === "admin") {
            res.status(403);
            throw new Error("Cannot delete an administrator account");
        }

        await user.deleteOne();
        res.json({ message: "Customer account deleted successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register, login, adminLogin, getProfile, updateProfile,
    addAddress, deleteAddress, getAllUsers, getCustomerById, deleteUser,
    getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart,
    getWishlist, toggleWishlist,
};

