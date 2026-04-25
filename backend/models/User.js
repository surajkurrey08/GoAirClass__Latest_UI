const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },
    mobileNumber: {
        type: String,
        required: [true, "Mobile number is required"],
        unique: true,
        trim: true,
    },
    referralCode: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["user", "agent", "finance", "support", "admin", "superadmin", "bus_operator", "hotel_operator"],
        default: "user",
    },
    adminUsername: {
        type: String,
        unique: true,
        sparse: true,
    },
    adminPassword: {
        type: String,
    },
    permissions: {
        type: [String],
        default: [],
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpiry: {
        type: Date,
        default: null,
    },
    otpAttempts: {
        type: Number,
        default: 0,
    },
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },
    dob: {
        type: Date,
    },
    nationality: {
        type: String,
        trim: true,
    },
    passportNumber: {
        type: String,
        trim: true,
    },
    passportExpiry: {
        type: Date,
    },
    frequentFlyer: {
        type: String,
        trim: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    profileImage: {
        type: String,
        default: null,
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
