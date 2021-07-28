const User = require('../models/User');
const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const advencedResults = require('../midlleware/advencedResults');


// @desc    Get startups to evaluate
// @oute    GET /api/v1/correction
// @access  Public/Admin
exports.getStartupsToRate = asyncHandler(async(req, res, next) => {
    if (!req.user) {
        return next(new ErrorResponse(`login first...`, 401));
    }
    const user = await User.findById(req.user.id);

    let startups = [];
    for (let i = 0; i < 5; i++) {
        let holder = 't_' + i.toString(10);
        const tmp = await Startup.findById(user.startup[holder]);
        if (tmp)
            startups.push(tmp);
    }

    res.status(200).json({
        success: true,
        data: startups
    });
});



// @desc    Update Mentor with new Startup to correct
// @route   Post /api/v1/users/correct/:id/:startupid
// @access  Public/Admin
exports.addCorrectionForMentor = asyncHandler(async(req, res, next) => {

    let startup = await Startup.findById(req.params.startupid);
    let user = await User.findById(req.params.id);

    if (!user || !startup) {
        if (!user)
            return next(new ErrorResponse(`the user with id ${req.params.id} not found`, 401));
        else
            return next(new ErrorResponse(`the startup with id ${req.params.startupid} not found`, 401));
    }
    // check the Mentor tocorrect startups
    if (user.mentoring > 4) {
        return next(new ErrorResponse(`the Mentor with id >${user.id}< can not evaluate this Startup...`, 401));
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

        // check for duplication in  user.startup
        if (user.startup[holder] == startup.id) {
            return next(new ErrorResponse(`the mentor already have this startup to evaluate`, 401));
        }
        if (!startup.mentor[holder0].m_id && !x) {
            x = holder0;
        }
        if (!user.startup[holder] && !y) {
            y = holder;
        }
        if (x && y) {
            user.startup[y] = startup.id;
            startup.mentor[x].m_id = user.id;
            user.mentoring++;
            startup.tocorrect++;
            break;
        }

    }
    user = await User.findByIdAndUpdate(req.params.id, user, {
        new: true,
        runValidators: true
    });
    startup = await Startup.findByIdAndUpdate(req.params.startupid, startup, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        user,
        startup
    });
});

// @desc    Update startups for evaluated points
// @oute    PUT /api/v1/correction/:id
// @access  Public/Admin/mentor
exports.evaluatStartup = asyncHandler(async(req, res, next) => {

    const user = await User.findById(req.user.id);

    if (!user) {
        console.log('----no user with ----');
    }
    let startup;


    // NEED MORE DATA ABOUT CORRECTION
    let x = -1;
    // ////////////
    for (let i = 0; i < 5; i++) {
        let holder = 't_' + i.toString(10);

        if (req.params.id == user.startup[holder]) {

            startup = await Startup.findById(req.params.id);
            if (!startup) {
                return next(new ErrorResponse(`startup not find with id >${req.params.id}<`, 404));
            }

            /////////////////
            for (let j = 0; j < 5; j++) {
                let holder0 = 'm_' + j.toString(10);

                if (startup.mentor[holder0].m_id == user.id) {
                    if (startup.mentor[holder0].finalGrade == true) {
                        return next(new ErrorResponse(`the startup already evaluated...`, 401))
                    }
                    // startup.mentor[holder0].gradeRating = req.body.gradeRating;
                    // startup.mentor[holder0].finalGrade = req.body.finalGrade;
                    // startup.mentor[holder0].fb = req.body.fb;
                    // startup.mentor[holder0].sr = req.body.sr;
                    startup.mentor[holder0] = req.body;
                    i = 6;
                    x = 1;
                    startup = await Startup.findByIdAndUpdate(req.params.id, startup, {
                        new: true,
                        runValidators: true
                    });
                    break;
                }

            }
        }
    }

    if (x == -1) {
        return next(new ErrorResponse(`no match...`, 401));
        console.log('no match...');
    }


    res.status(200).json({
        success: true,
        data: user,
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
    let message = 'not match btween Startup and Mentor';

    for (let i = 0; i < 5; i++) {
        let holder = 't_' + i.toString(10);
        let holder0 = 'm_' + i.toString(10);
        if (user.startup[holder] == startup.id) {
            user.startup[holder] = undefined;
            user.mentoring--;
            j++;
        }
        if (startup.mentor[holder0].m_id == user.id) {
            if (startup.mentor[holder0].finalGrade == true) {
                return next(new ErrorResponse(`the Mentor already evaluated the startup...`, 401));
            }
            for (let c = 1; c < 25; c++) {
                let t = 'db' + c.toString(10);
                startup.mentor[holder0][t] = -1;
            }
            startup.mentor[holder0].m_id = null;
            startup.mentor[holder0].total = -1;
            startup.mentor[holder0].sr = undefined;
            startup.mentor[holder0].fb = undefined;
            startup.mentor[holder0].finalGrade = false;

            startup.tocorrect--;
            j++;
        }
        if (j == 1) {
            message = 'success';
            startup = await Startup.findByIdAndUpdate(req.params.startupid, startup, {
                new: true,
                runValidators: true
            });
            console.log(`----------${startup.mentor[holder0]}----------`.blue)
            user = await User.findByIdAndUpdate(req.params.id, user, {
                new: true,
                runValidators: true
            });
            console.log(`---------------${user.startup[holder]}----------------------`.red)
            console.log(j);
            // console.log(user);
            // console.log(startup);
            break;
        }
    }
    res.status(200).json({
        success: message,
        user,
        startup
    });
});