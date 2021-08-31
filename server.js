const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const logger = require('./midlleware/logger');

const fileupload = require('express-fileupload');

const bodyParser = require('body-parser');

const color = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const errorHandler = require('./midlleware/errors');
const cookieParser = require('cookie-parser');

// 
const mongoSanitize = require('express-mongo-sanitize');

// Route files
const startups = require('./routes/startups');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const correction = require('./routes/correction');

const cors = require('cors');

// load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Body parser 
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger);
app.use(express.json({ limit: '50mb' }));

// adding the CORS header
app.use(cors({
    origin: '*'
        // origin: 'https://www.google.com/'
}));

// Cookie parser
app.use(cookieParser());

//  Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading  
app.use(fileupload());

// sanitize data
app.use(mongoSanitize());

// Set static folder 
app.use('/uploads', express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'));
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