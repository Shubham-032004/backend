import express from "express";

import {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    getProfile,
    logoutUser
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// =====================================================
// PUBLIC ROUTES
// =====================================================

// Register
router.post("/register", registerUser);

// Verify OTP
router.post("/verify-otp", verifyOTP);

// Resend OTP
router.post("/resend-otp", resendOTP);

// Login
router.post("/login", loginUser);


// =====================================================
// PROTECTED ROUTES
// =====================================================

// Get logged-in user's profile
router.get("/profile", protect, getProfile);

// Logout
router.post("/logout", protect, logoutUser);


export default router;