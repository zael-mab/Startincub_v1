const nodemailer = require("nodemailer");
const dotenv = require('dotenv');

dotenv.config({ path: '../config/config.env' });

const sendEmail = async(options) => {

    const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: "*************",
//             pass: "*************"
//         }
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.FROM_NAME} , <${process.env.FROM_EMAIL}>`,
//         from: `*********@gmail.com`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    const info = await transporter.sendMail(message);
    console.log('-------------------'.blue);

    console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
