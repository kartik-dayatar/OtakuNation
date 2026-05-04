const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const User   = require("../models/User");
const Order  = require("../models/Order");
const emailService = require("../utils/emailService");

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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = await User.create({ 
            firstName, 
            lastName, 
            email, 
            password,
            isEmailVerified: true, // Default to true
            verificationToken: null 
        });

        // Fire and forget email
        emailService.sendVerificationEmail(user, verificationToken).catch(console.error);

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
        const userAgent = req.headers["user-agent"] || "Unknown Device";

        // Check for new device login alert
        if (user.lastLoginDevice && user.lastLoginDevice !== userAgent) {
            emailService.sendNewLoginAlert(user, userAgent).catch(console.error);
        }

        // Update login tracking
        user.lastLoginDevice = userAgent;
        user.lastLoginAt = Date.now();
        await user.save();

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
// GET /api/users/verify-email/:token
// ────────────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            res.status(400);
            throw new Error("Invalid or expired verification token");
        }

        user.isEmailVerified = true;
        user.verificationToken = null;
        await user.save();

        // Send welcome email
        emailService.sendWelcomeEmail(user).catch(console.error);

        res.json({ message: "Email verified successfully. You can now login." });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/users/forgot-password
// ────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Security: Return success even if user not found
        if (!user) {
            return res.json({ success: true, message: "OTP sent to your email" });
        }

        // Rate limiting: 60 seconds
        if (user.resetOTPLastSent && (Date.now() - user.resetOTPLastSent) < 60000) {
            res.status(429);
            throw new Error("Please wait 60 seconds before requesting a new OTP");
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOTP = otp;
        user.resetOTPExpiry = Date.now() + 600000; // 10 minutes
        user.resetOTPAttempts = 0;
        user.resetOTPLastSent = Date.now();
        await user.save();

        emailService.sendPasswordResetEmail(user, otp).catch(console.error);

        res.json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/users/verify-otp
// ────────────────────────────────────────────────────
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.resetOTP) {
            res.status(400);
            throw new Error("Invalid request");
        }

        if (user.resetOTPExpiry < Date.now()) {
            res.status(400);
            throw new Error("OTP has expired, please request a new one");
        }

        if (user.resetOTPAttempts >= 5) {
            res.status(429);
            throw new Error("Too many wrong attempts, please request a new OTP");
        }

        if (otp !== user.resetOTP) {
            user.resetOTPAttempts += 1;
            await user.save();
            res.status(400);
            throw new Error(`Incorrect OTP. ${5 - user.resetOTPAttempts} attempts remaining`);
        }

        // OTP matches
        const resetToken = crypto.randomUUID(); // Requires Node 15+ or 14.17+
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 900000; // 15 minutes
        
        // Clear OTP fields
        user.resetOTP = null;
        user.resetOTPExpiry = null;
        user.resetOTPAttempts = 0;
        
        await user.save();

        res.json({ success: true, resetToken });
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// POST /api/users/reset-password
// ────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken:  resetToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            res.status(400);
            throw new Error("Reset link expired, please start over");
        }

        // Validate newPassword: min 8, one number, one letter
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            res.status(400);
            throw new Error("Password must be at least 8 characters and contain at least one letter and one number");
        }

        user.password = newPassword;
        
        // Clear all reset fields
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        user.resetOTP = null;
        user.resetOTPExpiry = null;
        user.resetOTPAttempts = 0;

        await user.save();

        emailService.sendPasswordChangedConfirmation(user).catch(console.error);

        res.json({ success: true, message: "Password reset successful" });
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
        let passwordChanged = false;
        if (req.body.newPassword) {
            if (!(await user.matchPassword(req.body.currentPassword))) {
                res.status(400);
                throw new Error("Current password is incorrect");
            }
            user.password = req.body.newPassword;
            passwordChanged = true;
        }

        const updated = await user.save();

        if (passwordChanged) {
            emailService.sendPasswordChangedConfirmation(updated).catch(console.error);
        }

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
        const { recipientName, addressLine1, addressLine2, city, state, postalCode, phone, type, isDefault } = req.body;

        if (isDefault) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }

        user.addresses.push({ 
            recipientName, 
            addressLine1, 
            addressLine2: addressLine2 || "",
            city, 
            state, 
            postalCode, 
            phone: phone || "",
            type: type || 'HOME',
            isDefault: isDefault || user.addresses.length === 0 
        });
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
// PUT /api/users/addresses/:addrId   (protected)
// ────────────────────────────────────────────────────
const updateAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const addr = user.addresses.id(req.params.addrId);
        if (!addr) {
            res.status(404);
            throw new Error("Address not found");
        }

        const { recipientName, addressLine1, addressLine2, city, state, postalCode, phone, type, isDefault } = req.body;

        if (isDefault && !addr.isDefault) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }

        addr.recipientName = recipientName || addr.recipientName;
        addr.addressLine1 = addressLine1 || addr.addressLine1;
        addr.addressLine2 = addressLine2 !== undefined ? addressLine2 : addr.addressLine2;
        addr.city = city || addr.city;
        addr.state = state || addr.state;
        addr.postalCode = postalCode || addr.postalCode;
        addr.phone = phone || addr.phone;
        addr.type = type || addr.type;
        if (isDefault !== undefined) addr.isDefault = isDefault;

        await user.save();
        res.json(user.addresses);
    } catch (err) {
        next(err);
    }
};

// ────────────────────────────────────────────────────
// PATCH /api/users/addresses/:addrId/default   (protected)
// ────────────────────────────────────────────────────
const setDefaultAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const addr = user.addresses.id(req.params.addrId);
        if (!addr) {
            res.status(404);
            throw new Error("Address not found");
        }

        user.addresses.forEach((a) => {
            a.isDefault = (a._id.toString() === req.params.addrId);
        });

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

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Filter out any cart items whose product has been deleted
        const validItems = (user.cart || []).filter((item) => item && item.product !== null);
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
        console.error("[addToCart] ERROR:", err.message, "| user:", req.user?._id, "| body:", req.body);
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
            const product = await require("../models/Product").findById(incoming.productId);
            if (!product) continue;

            const existingIdx = (user.cart || []).findIndex(
                (item) =>
                    item && item.product &&
                    item.product.toString() === incoming.productId &&
                    item.sizeLabel === (incoming.sizeLabel || null)
            );

            const incomingQty = Number(incoming.quantity) || 1;
            
            if (existingIdx > -1) {
                // Sum quantities and cap at stock
                const currentQty = user.cart[existingIdx].quantity;
                user.cart[existingIdx].quantity = Math.min(
                    currentQty + incomingQty,
                    product.stockQuantity || 99
                );
            } else {
                // New item: cap at stock
                user.cart.push({
                    product:   incoming.productId,
                    sizeLabel: incoming.sizeLabel || null,
                    quantity:  Math.min(incomingQty, product.stockQuantity || 99),
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
    verifyEmail, forgotPassword, verifyOTP, resetPassword,
    addAddress, updateAddress, deleteAddress, setDefaultAddress, getAllUsers, getCustomerById, deleteUser,
    getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart,
    getWishlist, toggleWishlist,
};

