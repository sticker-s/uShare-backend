const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("uShare DB connected");
    } catch (err) {
        console.error("failed to connect uShare DB ", err);

    }
};
module.exports = connectDB;