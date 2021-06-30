const mongoose = require('mongoose');


//*** change the Schema and get a relation with the mentor Users and delete the relation between startups and courses

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: Number,
        required: [true, 'Please add number if weeks']
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    startup: {
        type: mongoose.Schema.ObjectId,
        ref: 'Startup',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: true
    }
});

module.exports = mongoose.model('Course', CourseSchema);