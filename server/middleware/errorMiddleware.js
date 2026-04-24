// ── Global Error Handler ─────────────────────────────
const errorHandler = (err, req, res, next) => {
    // Default to 500 if statusCode wasn't set
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        // Stack trace only in development
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

// ── 404 Not Found Handler ────────────────────────────
const notFound = (req, res, next) => {
    const err = new Error(`Route not found – ${req.originalUrl}`);
    res.status(404);
    next(err);
};

module.exports = { errorHandler, notFound };
