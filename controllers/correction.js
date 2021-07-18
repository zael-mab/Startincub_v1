const User = require('../models/User');
const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const advencedResults = require('../midlleware/advencedResults');


// @desc    Get startups to evaluate
// @oute    GET /api/v1/auth/correction
// @access  Public/Admin
exports.getStartupsToRate = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    console.log('---up here----');
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


// @desc    Update startups for evaluated points
// @oute    PUT /api/v1/correction/:id
// @access  Public/Admin
exports.evaluatStartup = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);
    const startups = await Startup.findById(req.params.id);
    console.log(req.body.gradeRating);

    // NEED MORE DATA ABOUT CORRECTION
    let x = -1;
    for (let i = 0; i < 5; i++) {
        let holder = 't_' + i.toString(10);
        if (req.params.id == user.startup[holder]) {
            console.log(`${req.params.id} === ${user.startup[holder]}`);
            let holder0 = 'm_' + i.toString(10);
            for (let j = 0; j < 5; j++) {
                if (!startups.mentor[holder0]) {
                    req.body.mentor[holder0].m_id = user.id;
                    req.body.mentor[holder0].gradeRating = req.body.gradeRating;
                    break;
                }
            }
            // req.body.mentor.m_1.m_id = user.id;
            x = i;
            break;
        }
    }
    if (x === -1) {
        return next(new ErrorResponse(`you're not autorized to correct this startup with id > ${req.params.id}`, 401));
    }
    const startup = await Startup.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    console.log(startup);

    res.status(200).json({
        success: true,
        data: user,
        startup
    });

});


// @desc    Update Mentor with new Startup to correct
// @route   PUT /api/v1/auth/users/correct/:id/:startup
// @access  Public/Admin
exports.addCorrectionForMentor = asyncHandler(async(req, res, next) => {

    let startup = await Startup.findById(req.params.startup);
    let user = await User.findById(req.params.id);
    if (!user || !startup) {
        if (!user)
            return next(new ErrorResponse(`the user with id ${req.params.id} not found`, 401));
        else
            return next(new ErrorResponse(`the startup with id ${req.params.startup} not found`, 401));
    }
    // check the Mentor tocorrect startups
    if (user.mentoring > 4) {
        console.log(user.mentoring);
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
            console.log(x);
        }
        if (!user.startup[holder] && !y) {
            y = holder;
            console.log(y);
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
    startup = await Startup.findByIdAndUpdate(req.params.startup, startup, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        user,
        startup
    });
});