const Article = require("../models/Article");

// GET /api/articles
const getArticles = async (req, res, next) => {
    try {
        const { type } = req.query;
        let filter = { isPublished: true };
        if (type) {
            filter.type = type;
        }

        const articlesRaw = await Article.find(filter).sort({ publishedAt: -1 });

        // Resolve image path similar to products for Dev Server
        const articles = articlesRaw.map(a => {
            let resolvedUrl = a.imageUrl;
            if (resolvedUrl && !resolvedUrl.startsWith('http') && !resolvedUrl.startsWith('/src') && !resolvedUrl.startsWith('/assets') && !resolvedUrl.startsWith('data:')) {
                resolvedUrl = `/src/assets/images/${resolvedUrl}`;
            }

            return {
                ...a.toObject(),
                imageUrl: resolvedUrl
            };
        });

        res.json(articles);
    } catch (err) {
        next(err);
    }
};

module.exports = { getArticles };
