const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        // Don't expose stack traces in production
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = {
    errorHandler,
    notFoundHandler
};
