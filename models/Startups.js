const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const StartupSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Please add a name'],
            unique: true,
            trim: true,
            maxlength: [50, 'Name can not be more than 50 characters']
        },
        slug: String,
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description can not be more than 50 characters']
        },
        website: {
            type: String,
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                'Please use a valid URL with HTTP or HTTPS'
            ]
        },
        phone: {
            type: String,
            maxlength: [20, 'Phone number can not be longer than 20 characters']
        },
        email: {
            type: String,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please add a valid Email'
            ]
        },
        address: {
            type: String,
            required: [true, 'Please add an address']
        },
        location: {
            //  GeoJSON (look for mogoose geojson)
            type: {
                type: String,
                enum: ['Point'],
                // required: true
            },
            coordinates: {
                type: [Number],
                // required: true,
                index: '2dsphere'
            },
            fromattedAddress: String,
            street: String,
            city: String,
            state: String,
            zipcode: String,
            country: String
        },
        careers: {
            // Array of Strings
            type: [String],
            required: true,
            enum: [
                'Web Development',
                'Mobile Development',
                'UI/UX',
                'Data Science',
                'Business',
                'Other'
            ]
        },
        evaluated: {
            type: Boolean,
            default: false
        },
        tocorrect: {
            type: Number,
            default: 0
        },
        finelgrade: {
            type: Number,
            min: [0, 'Rating must be at least 0'],
            max: [5, 'Rating must can not be more than 5']
        },
        photo: {
            type: String,
            default: 'no-photo.jpg'
        },
        createdAt: {
            type: Date,
            default: Date.now,
            immutable: true
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            require: true
        },
        mentor: {
            m_0: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                    require: true
                },
                gradeRating: {
                    type: Number,
                    default: 0
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                description: {
                    type: String,
                    require: true
                }
            },
            m_1: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                    require: true
                },
                gradeRating: {
                    type: Number,
                    default: 0
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                description: {
                    type: String,
                    require: true
                }
            },
            m_2: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                    require: true
                },
                gradeRating: {
                    type: Number,
                    default: 0
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                description: {
                    type: String,
                    require: true
                }
            },
            m_3: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                    require: true
                },
                gradeRating: {
                    type: Number,
                    default: 0
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                description: {
                    type: String,
                    require: true
                }
            },
            m_4: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                    require: true
                },
                gradeRating: {
                    type: Number,
                    default: 0
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                description: {
                    type: String,
                    require: true
                }
            }
        }
    }
    // {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true }
    // }
);



// Create Startup slug from the name
// arrow function handle scoop defferently
StartupSchema.pre('save', function(next) {
    // console.log('Slugify run', this.name);
    this.slug = slugify(this.name, { lower: true });
    next();
});

// GEOCODE & Create location field
StartupSchema.pre('save', async function(next) {

    const loc = await geocoder.geocode(this.address);

    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        fromattedAddress: loc[0].fromattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    };

    // Do not save address in DB
    this.address = undefined;
    next();
});


StartupSchema.pre('save', function(next) {
    if (this.isModified('createdAt')) {
        this.invalidate('createdAt');
    }
    next();
});
// Cascade delte courses when a startups is deleted
// StartupSchema.pre('remove', async function(next) {
//     console.log(`Courses bieng removed from startup ${this._id}`);
//     await this.model('Course').deleteMany({ startup: this._id });
//     next();
// });

//  Reverse populate with virtuals
// StartupSchema.virtual('courses', {
//     ref: 'Course',
//     localField: '_id',
//     foreignField: 'startup',
//     justOne: false
// });

module.exports = mongoose.model('Startup', StartupSchema);