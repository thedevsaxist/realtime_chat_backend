"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../errors/AppError");
const logger_1 = require("../logger");
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    let error = { ...err };
    error.message = err.message;
    logger_1.logger.error(`Error: ${err.message}`, { stack: err.stack, path: req.path });
    // Handle specific errors manually if needed
    if (err.name === 'PrismaClientKnownRequestError') {
        error = new AppError_1.AppError('Validation Error', 400);
    }
    if (error instanceof AppError_1.AppError) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }
    // Fallback catch-all
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
};
exports.errorHandler = errorHandler;
