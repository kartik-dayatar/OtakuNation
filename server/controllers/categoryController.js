const Category = require("../models/Category");

// GET /api/categories
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
        res.json(categories);
    } catch (err) {
        next(err);
    }
};

module.exports = { getCategories };
