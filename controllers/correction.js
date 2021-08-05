const User = require('../models/User');
const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const advencedResults = require('../midlleware/advencedResults');
const { lookingForMentorId, lookingForIdPositions, clearStartups, clearSingleMentor } = require('../midlleware/correction');


// @desc    Get startup to evaluate
// @oute    GET /api/v1/correction/:startupid
// @access  Public/Mentor
exports.getStartupToRate = asyncHandler(async(req, res, next) => {

    if (!req.user) {
        return next(new ErrorResponse(`login first...`, 401));
    }

    let mentor = await User.findById(req.user.id);
    if (!mentor) {
        return next(new ErrorResponse(`no mentor with id >${req.user.id}<`, 401));
    }

    let startup = await Startup.findById(req.params.id);
    if (!startup) {
        return next(new ErrorResponse(`no mentor with id >${req.params.id}<`, 401));
    }

    const position = await lookingForMentorId(startup, mentor);
    if (position == -1) {
        return next(new ErrorResponse(`no link with Startip with id >${req.params.id}<`, 401));
    }

    const holder = 'm_' + position.toString(10);


    res.status(200).json({
        success: true,
        form: startup.form,
        mentor: startup.mentor[holder],
        Sname: startup.Sname,
        logo: startup.logo

    });
});


// @desc    Get startups to evaluate
// @oute    GET /api/v1/correction
// @access  Public/Mentor
exports.getStartupsToRate = asyncHandler(async(req, res, next) => {
    if (!req.user) {
        return next(new ErrorResponse(`login first...`, 401));
    }
    console.log(req.user.id);
    const user = await User.findById(req.user.id);

    let startups = [];
    if (user.role == 'mentor') {
        for (let i = 0; i < 5; i++) {
            let holder = 't_' + i.toString(10);
            let tmp = await Startup.findById(user.startup[holder]);

            if (tmp) {
                const position = await lookingForMentorId(tmp, user);

                const p_id = 'm_' + position.toString(10);

                const mentor = JSON.parse(JSON.stringify(tmp.mentor[p_id]))
                tmp.mentor = null;
                tmp.mentor[p_id] = mentor;
                startups.push(tmp);
            }
        }
    }
    if (user.role == 'admin') {
        startups = await Startup.find();
    }

    res.status(200).json({
        success: true,
        data: startups
    });
});



// @desc    Update Mentor with new Startup to correct
// @route   Post /api/v1/users/correct/:id/:startupid
// @access  Public/Admin
exports.addCorrectionToMentor = asyncHandler(async(req, res, next) => {

    let startup = await Startup.findById(req.params.startupid);
    let mentor = await User.findById(req.params.id);

    if (!startup && !mentor)
        return next(new ErrorResponse(`the mentor with id >${req.params.id}< and the startup with id >${req.params.startupid}< not found`, 401));
    if (!mentor)
        return next(new ErrorResponse(`the mentor with id ${req.params.id} not found`, 401));
    if (!startup)
        return next(new ErrorResponse(`the startup with id ${req.params.startupid} not found`, 401));
    // check the Mentor tocorrect startups
    if (mentor.mentoring > 4) {
        return next(new ErrorResponse(`the Mentor with id >${mentor.id}< can not evaluate this Startup...`, 401));
    }
    // check if the startup did not have enough evaluators
    if (startup.tocorrect > 4) {
        return next(new ErrorResponse(`the Startup with id >${startup.id}< already have evaluators...`, 401));
    }

    let x;
    let y;
    for (let i = 0; i < 5; i++) {
        const holder = 't_' + i.toString(10);
        const holder0 = 'm_' + i.toString(10);

        // check for duplication in  mentor.startup
        if (mentor.startup[holder] == startup.id) {
            return next(new ErrorResponse(`the mentor already have this startup to evaluate`, 401));
        }
        if (!startup.mentor[holder0].m_id && !x) {
            x = holder0;
        }
        if (!mentor.startup[holder] && !y) {
            y = holder;
        }
        if (x && y) {
            mentor.startup[y] = startup.id;
            startup.mentor[x].m_id = mentor.id;
            mentor.mentoring++;
            startup.tocorrect++;
            mentor = await mentor.save();
            startup = await startup.save();
            break;
        }

    }
    // mentor = await User.findByIdAndUpdate(req.params.id, mentor, {
    //     new: true,
    //     runValidators: true
    // });
    // startup = await Startup.findByIdAndUpdate(req.params.startupid, startup, {
    //     new: true,
    //     runValidators: true
    // });

    res.status(200).json({
        success: true,
        mentor,
        startup
    });
});

// @desc    Update startups for evaluated points
// @oute    PUT /api/v1/correction/:id
// @access  Public/Admin/mentor
exports.evaluatStartup = asyncHandler(async(req, res, next) => {

    const mentor = await User.findById(req.user.id);

    if (!mentor) {
        console.log('----no user with id----');
    }
    let startup;


    // NEED MORE DATA ABOUT CORRECTION
    // ////////////
    let i;
    for (i = 0; i < 5; i++) {
        let holder = 't_' + i.toString(10);

        if (req.params.id == mentor.startup[holder]) {

            startup = await Startup.findById(req.params.id);
            if (!startup) {
                return next(new ErrorResponse(`startup not find with id >${req.params.id}<`, 404));
            }
            const position = await lookingForMentorId(startup, mentor);
            if (position == -1) {
                return next(new ErrorResponse(`not mutch...1`, 401));
            }
            /////////////////
            let holder0 = 'm_' + position.toString(10);
            if (startup.mentor[holder0].finalGrade == true) {
                return next(new ErrorResponse(`the startup already evaluated...`, 401))
            }
            startup.mentor[holder0].finalGrade = req.body.finalGrade;
            startup.mentor[holder0].fb = req.body.fb;
            startup.mentor[holder0].sr = req.body.sr;
            startup.mentor[holder0].total = req.body.total;
            startup.mentor[holder0].note = req.body.note;
            startup = await Startup.findByIdAndUpdate(req.params.id, startup, {
                new: true,
                runValidators: true
            });
            break;
        }
    }

    if (i == 5) {
        return next(new ErrorResponse(`no match...2`, 401));
        console.log('no match...');
    }


    res.status(200).json({
        success: true,
        data: mentor,
        startup
    });

});


// @desc    Delete Startup from mentor
// @oute    DELETE /api/v1/correction/:id/:startupid
// @access  Public/Admin
exports.deleteStartupFromMentor = asyncHandler(async(req, res, next) => {
    let startup = await Startup.findById(req.params.startupid);
    if (!startup) {
        return next(new ErrorResponse(`Startup with id >${req.params.startupid}< not found...`, 401));
    }
    if (startup.tocorrect == 0) {
        return next(new ErrorResponse(`This Startup dont have any one to evaluate...`, 401));
    }
    // check the user
    let user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse(`User with id >${req.params.id}< not found...`, 401));
    }
    if (user.role != 'mentor') {
        return next(new ErrorResponse(`This User is not a Mentor...`, 401));
    }

    let j = -1;
    let message = 'No match btween Startup and Mentor';

    let position = await lookingForIdPositions(startup, user);
    if (position.i > -1 && position.j > -1) {

        let holder = 't_' + position.j.toString(10);
        let holder0 = 'm_' + position.i.toString(10);

        if (user.startup[holder] == startup.id) {
            user.startup[holder] = undefined;
            user.mentoring--;
            j++;
        }

        if (startup.mentor[holder0].m_id == user.id) {

            if (startup.mentor[holder0].finalGrade == true) {
                // user.save();
                return next(new ErrorResponse(`the Mentor already evaluated the startup...`, 401));
            }
            for (let c = 1; c < 25; c++) {
                let t = 'cq' + c.toString(10);
                startup.mentor[holder0].note[t] = -1;
            }
            startup.mentor[holder0].m_id = undefined;
            startup.mentor[holder0].total = -1;
            startup.mentor[holder0].sr = undefined;
            startup.mentor[holder0].fb = undefined;
            startup.mentor[holder0].finalGrade = false;
            startup.tocorrect--;
            j++;
        }
        if (j == 1) {
            message = 'success';
            user.save();
            startup.save();
        }
    }
    res.status(200).json({
        success: message,
        user,
        startup
    });
});



// @desc    Delete Startup from mentor
// @oute    DELETE /api/v1/correction/:id
// @access  Public/Admin
exports.clearMentor = asyncHandler(async(req, res, next) => {
    let mentor = await User.findById(req.params.id);
    if (!mentor) {
        return next(new ErrorResponse(`Mentor with id >${req.params.id} not found...<`, 404))
    }
    // check if the id for a Mentor role user
    if (mentor.role != 'mentor') {
        return next(new ErrorResponse(`the id >${req.params.id}< is not for a Mentor`, 401));
    }
    await clearStartups(mentor);
    await clearSingleMentor(mentor);

    res.status(200).json({
        success: true,
        mentor
    });
});