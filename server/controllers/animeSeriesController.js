const AnimeSeries = require("../models/AnimeSeries");

// GET /api/series
const getAnimeSeries = async (req, res, next) => {
    try {
        const seriesRaw = await AnimeSeries.find({ isActive: true }).sort({ displayOrder: 1 });
        
        const series = seriesRaw.map(s => {
            const url = s.thumbnailUrl;
            const resolvedUrl = (url && !url.startsWith('http') && !url.startsWith('/src') && !url.startsWith('/assets') && !url.startsWith('data:'))
                ? `/src/assets/images/${url}`
                : url;
            
            return {
                ...s.toObject(),
                thumbnailUrl: resolvedUrl
            };
        });

        res.json(series);
    } catch (err) {
        next(err);
    }
};

module.exports = { getAnimeSeries };
