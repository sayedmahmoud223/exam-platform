// ResError.js
export class ResError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.status = statusCode;
    }
}

// asyncHandler.js
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            next(err);
        });
    };
};

// globalError.js
export const globalError = (err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || 'An unexpected error occurred';
    return res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.MOOD === 'DEV' ? err.stack : undefined
    });
};
