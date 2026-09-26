import express from "express";

import {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    getProfile,
    logoutUser,
    uploadProfileImage,
    testCloudinary
} from "../controllers/auth.controller.js";

import {
    protect
} from "../middleware/auth.middleware.js";

import upload from "../middleware/upload.js";


const router = express.Router();


// =====================================================
// PUBLIC ROUTES
// =====================================================

// Register
router.post(
    "/register",
    registerUser
);


// Verify OTP
router.post(
    "/verify-otp",
    verifyOTP
);


// Resend OTP
router.post(
    "/resend-otp",
    resendOTP
);


// Login
router.post(
    "/login",
    loginUser
);


// =====================================================
// PROTECTED ROUTES
// =====================================================


// Get logged-in user's profile
router.get(
    "/profile",
    protect,
    getProfile
);


// Upload profile image
router.patch(
    "/profile/image",
    protect,
    upload.single("profileImage"),
    uploadProfileImage
);


// Logout
router.post(
    "/logout",
    protect,
    logoutUser
);



router.get(
    "/cloudinary-test",
    testCloudinary
);


export default router;