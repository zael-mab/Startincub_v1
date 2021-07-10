const ErrorResponse = require("../utils/errorResponse");

const advencedResults = (model, populate) => async(req, res, next) => {

    let query;
    //  Copy req.query
    const reqQuery = {...req.query };

    // Fields to exlude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Lopp over removeField and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    console.log(req.query);
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    // if (!reqQuery) {
    //     return next(new ErrorResponse('Error !!!', 404));
    // }

    //  Create operators ($gt, $gte, etc )
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //  Finding resource 
    query = model.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort 
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        // *** if theres a startups that have the same create date the pages have a problem in listing ***
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    // Executing query
    const results = await query;
    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.advencedResults = {
            success: true,
            count: results.length,
            pagination,
            data: results
        }
        // console.log(results);
    next();
};

module.exports = advencedResults;