const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');
// const asyncHandler = require('./async');

const uploadPhoto = (file, model) => {

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return (next(new ErrorResponse(`Please upload an image file `, 400)));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return (next(new ErrorResponse(`Please upload an image less than ${ process.env.MAX_FILE_UPLOAD }`, 400)));
    }
    // Create custom filename
    file.name = `photo_${model._id}${path.parse(file.name).ext}`;

    // delete the previous photo
    if (model.logo && model.logo != 'no-photo.jpg') {
        let previousPhoto = `/${process.cwd()}/public/uploads/${model.logo}`;
        if (fs.existsSync(previousPhoto)) {
            console.log('file exist');
            try {
                fs.unlinkSync(previousPhoto);
                console.log("File is deleted.");
            } catch (err) {
                console.log(err);
            }
        }

    }
    console.log(process.env.FILE_UPLOAD_PATH);
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return (next(new ErrorResponse(`Problem with file upload`, 500)));
        }
    });
    return file;
};

module.exports = uploadPhoto;