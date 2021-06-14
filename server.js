const express = require('express');
const dotenv = require('dotenv');
// require('dotenv').config({ path: '/custom/path/to/.env' })
const logger = require('./midlleware/logger');

const color = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const errorHandler = require('./midlleware/errors');
// Route files
const startups = require('./routes/startups');

// load env vars
dotenv.config({ path: './config/config.env' });
// Connect to database
connectDB();

const app = express();

// Body paser 
app.use(express.json());

app.use(logger);

//  Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//  MOUNT routers
app.use('/api/v1/startups', startups);


app.use(errorHandler);
// /////////////////////////

const PORT = process.env.PORT || 5000;


const server = app.listen(
    PORT,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow)
);

// Hndle unhandledpromise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // close server & exit process
    server.close(() => process.exit(1));
});