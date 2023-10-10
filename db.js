const mongoose = require('mongoose');

exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("db is connected")
    } catch (err) {
        console.log(err)
    }
}