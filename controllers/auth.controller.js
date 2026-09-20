
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendOTPEmail } from "../utils/sendEmail.js";


// =====================================================
// GENERATE OTP
// =====================================================

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};


// =====================================================
// REGISTER
// =====================================================

export const registerUser = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            phone,
            role,
            
        } = req.body;

        // Check required fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOTP();

        // Hash OTP before storing
        const hashedOTP = await bcrypt.hash(otp, 10);

        // OTP expires in 10 minutes
        const otpExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // Create user
       const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,

    role: role,

    isverified: false,

    otp: hashedOTP,
    otpExpiresAt
});

        // =============================================
        // SEND OTP TO EMAIL
        // =============================================

        await sendOTPEmail(email, otp);

        return res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to your email.",
            userId: user._id
        });

    } catch (error) {

        console.error("Register Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// VERIFY OTP
// =====================================================

export const verifyOTP = async (req, res) => {
    try {

        const { userId, otp } = req.body;

        // Check fields
        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: "User ID and OTP are required"
            });
        }

        // Find user and explicitly get OTP
        const user = await User
            .findById(userId)
            .select("+otp +otpExpiresAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Already verified
        if (user.isverified) {
            return res.status(400).json({
                success: false,
                message: "User is already verified"
            });
        }

        // Check OTP exists
        if (!user.otp || !user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP."
            });
        }

        // Check OTP expiry
        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // Compare OTP
        const isOTPValid = await bcrypt.compare(
            otp,
            user.otp
        );

        if (!isOTPValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Verify user
        user.isverified = true;

        // Remove OTP after successful verification
        user.otp = undefined;
        user.otpExpiresAt = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {

        console.error("Verify OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// RESEND OTP
// =====================================================

export const resendOTP = async (req, res) => {
    try {

        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Already verified
        if (user.isverified) {
            return res.status(400).json({
                success: false,
                message: "User is already verified"
            });
        }

        // Generate new OTP
        const otp = generateOTP();

        // Hash OTP
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Set expiry
        const otpExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        user.otp = hashedOTP;
        user.otpExpiresAt = otpExpiresAt;

        await user.save();

        // =============================================
        // SEND NEW OTP TO EMAIL
        // =============================================

        await sendOTPEmail(user.email, otp);

        return res.status(200).json({
            success: true,
            message: "New OTP sent successfully"
        });

    } catch (error) {

        console.error("Resend OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// LOGIN
// =====================================================

export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Get password because select:false
        const user = await User
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check email verification
        if (!user.isverified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first",
                userId: user._id
            });
        }

        // Update last login
        user.lastLogin = new Date();

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                tokenVersion: user.tokenVersion
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileImage: user.profileImage,
                isverified: user.isverified
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// GET PROFILE
// =====================================================

export const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        console.error("Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// LOGOUT
// =====================================================

export const logoutUser = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Invalidate existing JWT
        user.tokenVersion += 1;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {

        console.error("Logout Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

