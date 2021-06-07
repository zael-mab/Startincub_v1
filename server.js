const express = require('express');
const dotenv = require('dotenv');
const logger = require('./midlleware/logger');

const color = require('color');
const morgan = require('morgan');

// Route files
const startups = require('./routes/startups');

// load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

app.use(logger);

//  Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//  MOUNT routers
app.use('/api/v1/startups', startups);

// /////////////////////////
const PORT = process.env.PORT || 5000;


app.listen(
    PORT,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);