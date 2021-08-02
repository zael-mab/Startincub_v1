const Startup = require('../models/Startups');
const User = require('../models/User');


const lookingForMentorId = async(startup, mentor) => {


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

module.exports = lookingForMentorId;