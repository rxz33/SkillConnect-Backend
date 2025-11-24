// config/db.js
const mongoose = require("mongoose");

module.exports = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("🔴 MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};
