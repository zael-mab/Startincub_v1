const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    let error = {...err };
    error.message = err.message;

    console.log('---------------'.red);
    console.log(err);
    console.log('---------------'.red);


    console.log(err.stack);

    // Log to console for dev
    // console.log(err.message.red);
    console.log(error.message.blue);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate fields value entered';
        error = new ErrorResponse(message, 400);
    }

    // Mongoose valisation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map(val => val.message);
        error = new ErrorResponse(message, 400);
        console.log('validation Error...'.blue);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'server Error'
    })
};

module.exports = errorHandler;