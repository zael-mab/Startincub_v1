const NodeGeocoder = require('node-geocoder');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

// console.log(process.env.PORT);

// const options = {
//     provider: "google",
//     httpAdapter: 'https',
//     apiKey: "AIzaSyD13YWnTd1SF-w2iVggNxJXM0i8vCY9qZA",
//     formatter: null
// };

const options = {
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
const geocoder = NodeGeocoder(options);

module.exports = geocoder;