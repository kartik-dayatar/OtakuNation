const mongoose = require("mongoose");

// Translates SQL: news_articles + blog_posts tables
// Merged into a single collection with a `type` discriminator
// to avoid maintaining two near-identical schemas.

const articleSchema = new mongoose.Schema(
    {
        type: {
            type:     String,
            enum:     ["news", "blog"],
            required: true,
        },

        title:       { type: String, required: true, trim: true },
        excerpt:     { type: String, default: "" },
        imageUrl:    { type: String, default: null },   // e.g. 'editorial/news_jjk.png'

        // News-specific
        categoryTag: { type: String, default: null },   // 'Season 3', 'Film', 'Merch Drop'
        sourceUrl:   { type: String, default: null },

        // Blog-specific
        author:          { type: String, default: "OtakuNation Editorial" },
        readTimeMinutes: { type: Number, default: 3 },

        isPublished:  { type: Boolean, default: true },
        publishedAt:  { type: Date,    default: Date.now },
    },
    { timestamps: true }
);

articleSchema.index({ type: 1, isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model("Article", articleSchema);
