const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode ? res.statusCode : 500;
    let message = err.message;

    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    res.status(statusCode);

    res.json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = {
    errorHandler
};
