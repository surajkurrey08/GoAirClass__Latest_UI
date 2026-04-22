const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app");
const seedSuperAdmin = require("./config/seed");

// Increase timeout to handle slow internet/Atlas connections
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000
})
    .then(async () => {
        console.log("MongoDB Connected Successfully");
        await seedSuperAdmin();

        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(` 🚀 Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err.message);
        console.log("-----------------------------------------");
        console.log("TIP: If this fails, check your internet or white-list your IP in Atlas.");
        console.log("-----------------------------------------");
    });