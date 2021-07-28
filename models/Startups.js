const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const StartupSchema = new mongoose.Schema({
        Sname: {
            type: String,
            required: [true, 'Please add a name'],
            unique: true,
            trim: true,
            maxlength: [50, 'Name can not be more than 50 characters']
        },
        slug: String,
        epitch: {
            type: String,
            required: [true, 'Please add a epitch'],
            maxlength: [500, 'Description can not be more than 50 characters']
        },
        website: {
            type: String,
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                'Please use a valid URL with HTTP or HTTPS'
            ]
        },
        address: {
            type: String,
            required: [false, 'Please add an address']
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
        logo: {
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
        sds: {
            type: String,
            required: [true, 'add sds']
        },
        form: {
            dq1: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq2: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq3: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq4: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq5: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq6: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq7: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq8: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq9: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq10: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq11: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq12: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq13: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq14: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq15: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq16: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq17: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq18: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq19: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq20: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq21: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq22: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq23: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            },
            dq24: {
                type: String,
                // match: [
                //     /^\w+(?:\s+\w+){1,150}$/,
                //     'your answer should be 50 to 150 words'
                // ],
                // required: true
            }
        },
        mentor: {
            m_0: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                },
                dq1: {
                    type: Number,
                    default: -1
                },
                dq2: {
                    type: Number,
                    default: -1
                },
                dq3: {
                    type: Number,
                    default: -1
                },
                dq4: {
                    type: Number,
                    default: -1
                },
                dq5: {
                    type: Number,
                    default: -1
                },
                dq6: {
                    type: Number,
                    default: -1
                },
                dq7: {
                    type: Number,
                    default: -1
                },
                dq8: {
                    type: Number,
                    default: -1
                },
                dq9: {
                    type: Number,
                    default: -1
                },
                dq10: {
                    type: Number,
                    default: -1
                },
                dq11: {
                    type: Number,
                    default: -1
                },
                dq12: {
                    type: Number,
                    default: -1
                },
                dq13: {
                    type: Number,
                    default: -1
                },
                dq14: {
                    type: Number,
                    default: -1
                },
                dq15: {
                    type: Number,
                    default: -1
                },
                dq16: {
                    type: Number,
                    default: -1
                },
                dq17: {
                    type: Number,
                    default: -1
                },
                dq18: {
                    type: Number,
                    default: -1
                },
                dq19: {
                    type: Number,
                    default: -1
                },
                dq20: {
                    type: Number,
                    default: -1
                },
                dq21: {
                    type: Number,
                    default: -1
                },
                dq22: {
                    type: Number,
                    default: -1
                },
                dq23: {
                    type: Number,
                    default: -1
                },
                dq24: {
                    type: Number,
                    default: -1
                },
                total: {
                    type: Number,
                    default: -1
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                sr: {
                    type: String
                },
                fb: {
                    type: String,
                    default: null
                }
            },
            m_1: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                },
                dq1: {
                    type: Number,
                    default: -1
                },
                dq2: {
                    type: Number,
                    default: -1
                },
                dq3: {
                    type: Number,
                    default: -1
                },
                dq4: {
                    type: Number,
                    default: -1
                },
                dq5: {
                    type: Number,
                    default: -1
                },
                dq6: {
                    type: Number,
                    default: -1
                },
                dq7: {
                    type: Number,
                    default: -1
                },
                dq8: {
                    type: Number,
                    default: -1
                },
                dq9: {
                    type: Number,
                    default: -1
                },
                dq10: {
                    type: Number,
                    default: -1
                },
                dq11: {
                    type: Number,
                    default: -1
                },
                dq12: {
                    type: Number,
                    default: -1
                },
                dq13: {
                    type: Number,
                    default: -1
                },
                dq14: {
                    type: Number,
                    default: -1
                },
                dq15: {
                    type: Number,
                    default: -1
                },
                dq16: {
                    type: Number,
                    default: -1
                },
                dq17: {
                    type: Number,
                    default: -1
                },
                dq18: {
                    type: Number,
                    default: -1
                },
                dq19: {
                    type: Number,
                    default: -1
                },
                dq20: {
                    type: Number,
                    default: -1
                },
                dq21: {
                    type: Number,
                    default: -1
                },
                dq22: {
                    type: Number,
                    default: -1
                },
                dq23: {
                    type: Number,
                    default: -1
                },
                dq24: {
                    type: Number,
                    default: -1
                },
                total: {
                    type: Number,
                    default: -1
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                sr: {
                    type: String
                },
                fb: {
                    type: String,
                    default: null
                }
            },
            m_2: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                },
                dq1: {
                    type: Number,
                    default: -1
                },
                dq2: {
                    type: Number,
                    default: -1
                },
                dq3: {
                    type: Number,
                    default: -1
                },
                dq4: {
                    type: Number,
                    default: -1
                },
                dq5: {
                    type: Number,
                    default: -1
                },
                dq6: {
                    type: Number,
                    default: -1
                },
                dq7: {
                    type: Number,
                    default: -1
                },
                dq8: {
                    type: Number,
                    default: -1
                },
                dq9: {
                    type: Number,
                    default: -1
                },
                dq10: {
                    type: Number,
                    default: -1
                },
                dq11: {
                    type: Number,
                    default: -1
                },
                dq12: {
                    type: Number,
                    default: -1
                },
                dq13: {
                    type: Number,
                    default: -1
                },
                dq14: {
                    type: Number,
                    default: -1
                },
                dq15: {
                    type: Number,
                    default: -1
                },
                dq16: {
                    type: Number,
                    default: -1
                },
                dq17: {
                    type: Number,
                    default: -1
                },
                dq18: {
                    type: Number,
                    default: -1
                },
                dq19: {
                    type: Number,
                    default: -1
                },
                dq20: {
                    type: Number,
                    default: -1
                },
                dq21: {
                    type: Number,
                    default: -1
                },
                dq22: {
                    type: Number,
                    default: -1
                },
                dq23: {
                    type: Number,
                    default: -1
                },
                dq24: {
                    type: Number,
                    default: -1
                },
                total: {
                    type: Number,
                    default: -1
                },
                description: {
                    type: String,
                },
                total: {
                    type: Number,
                    default: -1
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                sr: {
                    type: String
                },
                fb: {
                    type: String,
                    default: null
                }
            },
            m_3: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                },
                dq1: {
                    type: Number,
                    default: -1
                },
                dq2: {
                    type: Number,
                    default: -1
                },
                dq3: {
                    type: Number,
                    default: -1
                },
                dq4: {
                    type: Number,
                    default: -1
                },
                dq5: {
                    type: Number,
                    default: -1
                },
                dq6: {
                    type: Number,
                    default: -1
                },
                dq7: {
                    type: Number,
                    default: -1
                },
                dq8: {
                    type: Number,
                    default: -1
                },
                dq9: {
                    type: Number,
                    default: -1
                },
                dq10: {
                    type: Number,
                    default: -1
                },
                dq11: {
                    type: Number,
                    default: -1
                },
                dq12: {
                    type: Number,
                    default: -1
                },
                dq13: {
                    type: Number,
                    default: -1
                },
                dq14: {
                    type: Number,
                    default: -1
                },
                dq15: {
                    type: Number,
                    default: -1
                },
                dq16: {
                    type: Number,
                    default: -1
                },
                dq17: {
                    type: Number,
                    default: -1
                },
                dq18: {
                    type: Number,
                    default: -1
                },
                dq19: {
                    type: Number,
                    default: -1
                },
                dq20: {
                    type: Number,
                    default: -1
                },
                dq21: {
                    type: Number,
                    default: -1
                },
                dq22: {
                    type: Number,
                    default: -1
                },
                dq23: {
                    type: Number,
                    default: -1
                },
                dq24: {
                    type: Number,
                    default: -1
                },
                total: {
                    type: Number,
                    default: -1
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                sr: {
                    type: String
                },
                fb: {
                    type: String,
                    default: null
                }
            },
            m_4: {
                m_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                },
                dq1: {
                    type: Number,
                    default: -1
                },
                dq2: {
                    type: Number,
                    default: -1
                },
                dq3: {
                    type: Number,
                    default: -1
                },
                dq4: {
                    type: Number,
                    default: -1
                },
                dq5: {
                    type: Number,
                    default: -1
                },
                dq6: {
                    type: Number,
                    default: -1
                },
                dq7: {
                    type: Number,
                    default: -1
                },
                dq8: {
                    type: Number,
                    default: -1
                },
                dq9: {
                    type: Number,
                    default: -1
                },
                dq10: {
                    type: Number,
                    default: -1
                },
                dq11: {
                    type: Number,
                    default: -1
                },
                dq12: {
                    type: Number,
                    default: -1
                },
                dq13: {
                    type: Number,
                    default: -1
                },
                dq14: {
                    type: Number,
                    default: -1
                },
                dq15: {
                    type: Number,
                    default: -1
                },
                dq16: {
                    type: Number,
                    default: -1
                },
                dq17: {
                    type: Number,
                    default: -1
                },
                dq18: {
                    type: Number,
                    default: -1
                },
                dq19: {
                    type: Number,
                    default: -1
                },
                dq20: {
                    type: Number,
                    default: -1
                },
                dq21: {
                    type: Number,
                    default: -1
                },
                dq22: {
                    type: Number,
                    default: -1
                },
                dq23: {
                    type: Number,
                    default: -1
                },
                dq24: {
                    type: Number,
                    default: -1
                },
                total: {
                    type: Number,
                    default: -1
                },
                finalGrade: {
                    type: Boolean,
                    default: false
                },
                sr: {
                    type: String
                },
                fb: {
                    type: String,
                    default: null
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
    this.slug = slugify(this.Sname, { lower: true });
    next();
});

// GEOCODE & Create location field
StartupSchema.pre('save', async function(next) {

    if (this.address) {

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
        this.address = undefined;
    }


    // Do not save address in DB
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