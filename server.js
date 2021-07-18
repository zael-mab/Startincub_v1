const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const logger = require('./midlleware/logger');

const fileupload = require('express-fileupload');

const color = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const errorHandler = require('./midlleware/errors');
const cookieParser = require('cookie-parser');

// Route files
const startups = require('./routes/startups');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const correction = require('./routes/correction');

// load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Body parser 
app.use(express.json());

// Cookie parser
// app.use(cookieParser);

app.use(logger);

//  Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading  
app.use(fileupload());

// Set static folder 
app.use(express.static(path.join(__dirname, 'public')));

//  MOUNT routers
app.use('/api/v1/startups', startups);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/correction', correction);


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