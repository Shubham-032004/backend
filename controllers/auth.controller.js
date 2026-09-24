import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";


// ==========================================
// Generate OTP
// ==========================================

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};


// ==========================================
// Generate JWT Token
// ==========================================

const generateToken = (user) => {
    return jwt.sign(
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
};


// ==========================================
// REGISTER
// ==========================================

export const registerUser = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            phone,
            role
        } = req.body;


        // -----------------------------
        // Validation
        // -----------------------------

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and phone are required"
            });
        }


        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }


        // -----------------------------
        // Check existing user
        // -----------------------------

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });


        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }


        // -----------------------------
        // Hash Password
        // -----------------------------

        const hashedPassword = await bcrypt.hash(password, 10);


        // -----------------------------
        // Generate OTP
        // -----------------------------

        const otp = generateOTP();

        const hashedOTP = await bcrypt.hash(otp, 10);


        // OTP expiry
        const otpExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );


        // -----------------------------
        // Create User
        // -----------------------------

        const user = await User.create({

            name,

            email: email.toLowerCase(),

            password: hashedPassword,

            phone,

            role: role || "patient",

            isverified: false,

            otp: hashedOTP,

            otpExpiresAt

        });


        // ==========================================
        // EMAIL DISABLED FOR DEVELOPMENT
        // ==========================================

        // await sendOTPEmail(email, otp);


        // -----------------------------
        // Response
        // -----------------------------

        return res.status(201).json({

            success: true,

            message:
                "Registration successful. Use any OTP to verify your account.",

            userId: user._id,

            // Development only
            generatedOTP: otp

        });


    } catch (error) {

        console.error("Register Error:", error);

        return res.status(500).json({

            success: false,

            message: "Registration failed",

            error: error.message

        });

    }
};


// ==========================================
// VERIFY OTP
// ==========================================

export const verifyOTP = async (req, res) => {

    try {

        const {
            userId,
            otp
        } = req.body;


        // -----------------------------
        // Validation
        // -----------------------------

        if (!userId || !otp) {

            return res.status(400).json({

                success: false,

                message: "userId and OTP are required"

            });

        }


        // -----------------------------
        // Find User
        // -----------------------------

        const user = await User.findById(userId)
            .select("+otp +otpExpiresAt");


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // ==========================================
        // DEVELOPMENT MODE
        // ==========================================
        // IMPORTANT:
        // OTP comparison is intentionally disabled.
        // Any OTP entered by user will be accepted.
        // ==========================================


        user.isverified = true;

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

            message: "OTP verification failed",

            error: error.message

        });

    }
};


// ==========================================
// RESEND OTP
// ==========================================

export const resendOTP = async (req, res) => {

    try {

        const {
            userId
        } = req.body;


        if (!userId) {

            return res.status(400).json({

                success: false,

                message: "userId is required"

            });

        }


        // -----------------------------
        // Find User
        // -----------------------------

        const user = await User.findById(userId);


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // -----------------------------
        // Generate New OTP
        // -----------------------------

        const otp = generateOTP();

        const hashedOTP = await bcrypt.hash(otp, 10);


        user.otp = hashedOTP;

        user.otpExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );


        await user.save();


        // ==========================================
        // EMAIL DISABLED FOR DEVELOPMENT
        // ==========================================

        // await sendOTPEmail(user.email, otp);


        return res.status(200).json({

            success: true,

            message: "New OTP generated successfully",

            // Development only
            generatedOTP: otp

        });


    } catch (error) {

        console.error("Resend OTP Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to resend OTP",

            error: error.message

        });

    }
};


// ==========================================
// LOGIN
// ==========================================

export const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // -----------------------------
        // Validation
        // -----------------------------

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required"

            });

        }


        // -----------------------------
        // Find User
        // -----------------------------

        const user = await User.findOne({
            email: email.toLowerCase()
        }).select("+password");


        if (!user) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password"

            });

        }


        // -----------------------------
        // Check Password
        // -----------------------------

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!isPasswordMatch) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password"

            });

        }


        // -----------------------------
        // Check Verification
        // -----------------------------

        if (!user.isverified) {

            return res.status(403).json({

                success: false,

                message:
                    "Please verify your account before login"

            });

        }


        // -----------------------------
        // Update Last Login
        // -----------------------------

        user.lastLogin = new Date();

        await user.save();


        // -----------------------------
        // Generate Token
        // -----------------------------

        const token = generateToken(user);


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

                isverified: user.isverified,

                profileImage: user.profileImage

            }

        });


    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({

            success: false,

            message: "Login failed",

            error: error.message

        });

    }
};


// ==========================================
// GET PROFILE
// ==========================================

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

        console.error("Get Profile Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to get profile",

            error: error.message

        });

    }
};


// ==========================================
// LOGOUT
// ==========================================

export const logoutUser = async (req, res) => {

    try {

        const user = await User.findById(req.user.id);


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // Increment token version
        // Old JWT will become invalid

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

            message: "Logout failed",

            error: error.message

        });

    }
};