const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');
const { getOtp, verifyOtp } = require('../controllers/authController');

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

const runTests = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for testing");

        const testMobile = "9999999999";
        
        // 1. Clean up existing test user
        await User.deleteOne({ mobileNumber: testMobile });
        console.log("Cleaned up test user");

        // 2. Test getOtp for non-existent user
        console.log("\n--- Test 1: getOtp for non-existent user ---");
        const req1 = { body: { mobileNumber: testMobile } };
        const res1 = mockRes();
        await getOtp(req1, res1);
        console.log("Status:", res1.statusCode);
        console.log("Body:", res1.body);
        if (res1.statusCode === 404) {
            console.log("PASSED: getOtp returned 404 for non-existent user");
        } else {
            console.log("FAILED: getOtp should have returned 404");
        }

        // 3. Create user and test getOtp
        console.log("\n--- Test 2: getOtp for existing user ---");
        const user = new User({
            fullName: "Test User",
            mobileNumber: testMobile,
            role: "user"
        });
        await user.save();
        
        const res2 = mockRes();
        await getOtp(req1, res2);
        console.log("Status:", res2.statusCode);
        console.log("Body:", res2.body);
        if (res2.statusCode === 200) {
            console.log("PASSED: getOtp returned 200 for existing user");
        } else {
            console.log("FAILED: getOtp should have returned 200");
        }

        // 4. Test verifyOtp with wrong OTP
        console.log("\n--- Test 3: verifyOtp with wrong OTP (Attempt 1) ---");
        const req3 = { body: { mobileNumber: testMobile, otp: "000000" } };
        const res3 = mockRes();
        await verifyOtp(req3, res3);
        console.log("Status:", res3.statusCode);
        console.log("Body:", res3.body);
        
        const userAfter1 = await User.findOne({ mobileNumber: testMobile });
        console.log("Attempts count:", userAfter1.otpAttempts);
        if (userAfter1.otpAttempts === 1) {
            console.log("PASSED: Attempts count incremented");
        } else {
            console.log("FAILED: Attempts count should be 1");
        }

        // 5. Test max attempts
        console.log("\n--- Test 4: verifyOtp max attempts ---");
        await verifyOtp(req3, mockRes()); // Attempt 2
        await verifyOtp(req3, mockRes()); // Attempt 3
        
        const res4 = mockRes();
        await verifyOtp(req3, res4); // Attempt 4
        console.log("Status:", res4.statusCode);
        console.log("Body:", res4.body);
        if (res4.body.message.includes("Maximum OTP attempts exceeded")) {
            console.log("PASSED: Max attempts exceeded message received");
        } else {
            console.log("FAILED: Should have blocked due to max attempts");
        }

        // 6. Test reset attempts on new getOtp
        console.log("\n--- Test 5: Reset attempts on new getOtp ---");
        await getOtp(req1, mockRes());
        const userAfterReset = await User.findOne({ mobileNumber: testMobile });
        console.log("Attempts count after reset:", userAfterReset.otpAttempts);
        if (userAfterReset.otpAttempts === 0) {
            console.log("PASSED: Attempts count reset to 0");
        } else {
            console.log("FAILED: Attempts count should be 0");
        }

        // Clean up
        await User.deleteOne({ mobileNumber: testMobile });
        console.log("\nCleaned up test user");
        
    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

runTests();
