const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        trim: true,
        required: [true, 'Please add your first name']
    },
    lastname: {
        type: String,
        trim: true,
        required: [true, 'Please add your last name']
    },
    phone: {
        type: String,
        trim: true,
        // default: null,
        required: [true, 'Please add your phone number']
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, 'Please add an email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'mentor', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    mentoring: {
        type: Number,
        default: 0,
        min: [0, 'must be at least 0'],
        max: [5, 'more then 5']

    },
    strtup: {
        t_1: {
            type: mongoose.Schema.ObjectId,
            ref: 'Startup',
            require: true
        },
        t_2: {
            type: mongoose.Schema.ObjectId,
            ref: 'Startup',
            require: true
        },
        t_3: {
            type: mongoose.Schema.ObjectId,
            ref: 'Startup',
            require: true
        },
        t_4: {
            type: mongoose.Schema.ObjectId,
            ref: 'Startup',
            require: true
        },
        t_5: {
            type: mongoose.Schema.ObjectId,
            ref: 'Startup',
            require: true
        }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//  Encrypt password  using  bcrypt
UserSchema.pre('save', async function(next) {

    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//  Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entred pasword to hashed password in database
UserSchema.methods.matchPassword = async function(entredPassword) {
    return await bcrypt.compare(entredPassword, this.password);
};

// Generate and hash password Token
UserSchema.methods.getResetPasswordToken = function() {

    // generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};


// Cascade delete startup when a user(role = user) is deleted
// StartupSchema.pre('remove', async function(next) {
//     console.log(`Startup bieng removed from user ${this._id}`);
//     await this.model('Startups').deleteMany({ user: this._id });
//     next();
// });

module.exports = mongoose.model('User', UserSchema);