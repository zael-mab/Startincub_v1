const asyncHandler = require('./async');
const Startup = require('../models/Startups');
const User = require('../models/User');
const { startSession } = require('../models/User');

exports.lookingForMentorId = async(startup, mentor) => {

    let i;
    let j = -1;
    for (i = 0; i < 5; i++) {
        let holder = 't_' + i.toString(10);
        if (mentor.startup[holder] == startup.id) {
            for (j = 0; j < 5; j++) {
                let holder0 = 'm_' + j.toString(10);
                if (startup.mentor[holder0].m_id == mentor.id) {
                    return (j);
                }
            }
        }
    }
    if (i == 5) {
        console.log('--no match--');
        return (j);
    }
};


exports.clearStartups = asyncHandler(async(mentor) => {

    for (let i = 0; i < 5; i++) {
        let holder = 't_' + i.toString(10);
        if (mentor.startup[holder]) {
            let startup = await Startup.findById(mentor.startup[holder]);
            console.log(` --->${mentor.startup[holder]}`.green);

            for (let j = 0; j < 5; j++) {
                let holder0 = 'm_' + j.toString(10);
                if (startup.mentor[holder0].m_id == mentor.id && startup.mentor[holder0].finalGrade == false) {
                    console.log(`mentorId --->${startup.mentor[holder0].m_id}`.blue);
                    for (let c = 1; c < 25; c++) {
                        let t = 'cq' + c.toString(10);
                        startup.mentor[holder0].note[t] = -1;
                    }

                    startup.mentor[holder0].m_id = undefined;
                    startup.mentor[holder0].total = -1;
                    startup.mentor[holder0].sr = undefined;
                    startup.mentor[holder0].fb = undefined;
                    startup.tocorrect--;
                    break;
                }
            }
            try {
                startup = await startup.save();
            } catch (err) {
                console.log(err);
            }
        }
    }
});


exports.clearMentors = asyncHandler(async(startup) => {

    for (let i = 0; i < 5; i++) {
        let holder = 'm_' + i.toString(10);
        if (startup.mentor[holder].m_id) {

            let mentor = await User.findById(startup.mentor[holder].m_id);
            if (mentor) {

                for (let j = 0; j < 5; j++) {
                    let holder0 = 't_' + j.toString(10);
                    if (mentor.startup[holder0] == startup.id) {
                        mentor.startup[holder0] = undefined;
                        mentor.mentoring--;
                        try {
                            mentor = await mentor.save();
                        } catch (err) {
                            console.log(err);
                        }
                        break;
                    }
                }
            }
        }
    }
});


exports.clearSingleMentor = asyncHandler(async(mentor) => {
    for (let i = 0; i < 5; i++) {
        let holder = 't_' + i.toString(10);
        if (mentor.startup[holder]) {
            mentor.startup[holder] = undefined;
            mentor.mentoring--;
        }
    }
    try {
        mentor = await mentor.save();
        //     // console.log(mentor);
    } catch (err) {
        console.log(err);
    }
});


exports.lookingForIdPositions = async(startup, mentor) => {

    let res = {
        i: -1,
        j: -1,
    };
    let i;
    let j = -1;
    for (i = 0; i < 5; i++) {
        let holder = 'm_' + i.toString(10);
        if (startup.mentor[holder].m_id == mentor.id) {
            for (j = 0; j < 5; j++) {
                let holder0 = 't_' + j.toString(10);
                if (mentor.startup[holder0] == startup.id) {
                    res.j = j;
                    res.i = i;
                    return (res);
                }
            }
        }
    }
    if (i == 5) {
        console.log('--no match--');
        res.i = i;
        return (res);
    }
};