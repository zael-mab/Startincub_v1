const mongoose = require('mongoose');

const connectDB = async() => {
    // const conn = await mongoose.connect(process.env.MONGO_URI, {
    //     useNewUrlParser: true,
    //     useCreateIndex: true,
    //     useFindAndModify: false,
    //     useUnifiedTopology: true
    // });
    const conn = await mongoose.connect('mongodb://localhost:27017/test', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`.brightMagenta);
};

module.exports = connectDB;