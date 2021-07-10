const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

//  Load models
const Startup = require('./models/Startups');
const Course = require('./models/Course');
const User = require('./models/User');


// const { exit } = require('process');

// connect to DB
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then((res) => console.log('> Connected...'.bgCyan))
    .catch(err => console.log(`> Error while connecting to mongoDB : ${err.message}`.underline.red));

const startups = JSON.parse(fs.readFileSync(`${__dirname}/_data/startups.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));

//Import into DB
const importData = async() => {
    try {
        // await Startup.create(startups);
        // await Course.create(courses);
        await User.create(users);

        console.log('Data Imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

// Delete data
const deleteData = async() => {
    try {
        await Startup.deleteMany();
        // await Course.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

//
if (process.argv[2] === '-import' || process.argv[2] === '-I') {
    importData();
} else if (process.argv[2] === '-delete' || process.argv[2] === '-D') {
    deleteData();
} else {
    console.log(`Error at argument > ${process.argv[2]}`.red);
    exit();
}