const mongoose = require("mongoose");
const { register } = require("./controllers/userController");

// mock req, res, next
const req = {
    body: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123"
    }
};

const res = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log("Response:", data);
        process.exit(0);
    }
};

const next = function (err) {
    if (err) {
        console.error("Next called with Error:", err.message);
    } else {
        console.log("Next called");
    }
    process.exit(1);
};

const run = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/otakunation");
        
        // Let's clear the user first
        const User = require("./models/User");
        await User.deleteOne({ email: "test@example.com" });

        await register(req, res, next);
    } catch (e) {
        console.error("Uncaught exception:", e);
        process.exit(1);
    }
}
run();
