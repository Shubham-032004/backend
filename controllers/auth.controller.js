import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";


// ======================================================
// GENERATE OTP
// =====================================================

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};


// =====================================================
// GENERATE JWT TOKEN
// =====================================================

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


// =====================================================
// REGISTER USER
// =====================================================

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
                message:
                    "Name, email, password and phone are required"
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters"
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
                message:
                    "User with this email already exists"
            });

        }


        // -----------------------------
        // Hash password
        // -----------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // -----------------------------
        // Generate OTP
        // -----------------------------

        const otp = generateOTP();

        const hashedOTP = await bcrypt.hash(
            otp,
            10
        );


        const otpExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );


        // -----------------------------
        // Create user
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


        // -----------------------------
        // Email disabled for development
        // -----------------------------

        // await sendOTPEmail(email, otp);


        return res.status(201).json({

            success: true,

            message:
                "Registration successful. Use any OTP to verify your account.",

            userId: user._id,

            // Development only
            generatedOTP: otp

        });


    } catch (error) {

        console.error(
            "Register Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Registration failed",

            error: error.message

        });

    }

};


// =====================================================
// VERIFY OTP
// =====================================================

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

                message:
                    "userId and OTP are required"

            });

        }


        // -----------------------------
        // Find user
        // -----------------------------

        const user = await User.findById(userId)
            .select("+otp +otpExpiresAt");


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // =================================================
        // DEVELOPMENT MODE
        // Any OTP is accepted
        // =================================================

        user.isverified = true;

        user.otp = undefined;

        user.otpExpiresAt = undefined;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Email verified successfully"

        });


    } catch (error) {

        console.error(
            "Verify OTP Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "OTP verification failed",

            error: error.message

        });

    }

};


// =====================================================
// RESEND OTP
// =====================================================

export const resendOTP = async (req, res) => {

    try {

        const {
            userId
        } = req.body;


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "userId is required"

            });

        }


        // -----------------------------
        // Find user
        // -----------------------------

        const user = await User.findById(userId);


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // -----------------------------
        // Generate new OTP
        // -----------------------------

        const otp = generateOTP();

        const hashedOTP = await bcrypt.hash(
            otp,
            10
        );


        user.otp = hashedOTP;

        user.otpExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );


        await user.save();


        // -----------------------------
        // Email disabled for development
        // -----------------------------

        // await sendOTPEmail(user.email, otp);


        return res.status(200).json({

            success: true,

            message:
                "New OTP generated successfully",

            // Development only
            generatedOTP: otp

        });


    } catch (error) {

        console.error(
            "Resend OTP Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to resend OTP",

            error: error.message

        });

    }

};


// =====================================================
// LOGIN USER
// =====================================================

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

                message:
                    "Email and password are required"

            });

        }


        // -----------------------------
        // Find user
        // -----------------------------

        const user = await User.findOne({

            email: email.toLowerCase()

        }).select("+password");


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // -----------------------------
        // Check password
        // -----------------------------

        const isPasswordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // -----------------------------
        // Check verification
        // -----------------------------

        if (!user.isverified) {

            return res.status(403).json({

                success: false,

                message:
                    "Please verify your account before login"

            });

        }


        // -----------------------------
        // Last login
        // -----------------------------

        user.lastLogin = new Date();

        await user.save();


        // -----------------------------
        // Generate token
        // -----------------------------

        const token = generateToken(user);


        return res.status(200).json({

            success: true,

            message:
                "Login successful",

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

        console.error(
            "Login Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Login failed",

            error: error.message

        });

    }

};


// =====================================================
// GET PROFILE
// =====================================================

export const getProfile = async (req, res) => {

    try {

        const user = await User.findById(
            req.user.id
        );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        return res.status(200).json({

            success: true,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: user.role,

                isverified: user.isverified,

                profileImage: user.profileImage,

                lastLogin: user.lastLogin,

                createdAt: user.createdAt,

                updatedAt: user.updatedAt

            }

        });


    } catch (error) {

        console.error(
            "Get Profile Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to get profile",

            error: error.message

        });

    }

};


// =====================================================
// LOGOUT USER
// =====================================================

export const logoutUser = async (req, res) => {

    try {

        const user = await User.findById(
            req.user.id
        );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // Increment token version
        // Old token becomes invalid

        user.tokenVersion += 1;

        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Logout successful"

        });


    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Logout failed",

            error: error.message

        });

    }

};


// =====================================================
// UPLOAD PROFILE IMAGE
// =====================================================

export const uploadProfileImage = async (req, res) => {
    try {

        // ==========================================
        // Check file
        // ==========================================

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a profile image"
            });
        }


        console.log("File received:", {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            bufferSize: req.file.buffer?.length
        });


        // ==========================================
        // Find user
        // ==========================================

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        // ==========================================
        // Upload to Cloudinary
        // ==========================================

        const result = await new Promise((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "clinexa/profile-images",
                    resource_type: "image"
                },

                (error, result) => {

                    if (error) {
                        console.error(
                            "Cloudinary Upload Error:",
                            error
                        );

                        reject(error);

                    } else {

                        console.log(
                            "Cloudinary Upload Success:",
                            result.secure_url
                        );

                        resolve(result);
                    }
                }
            );


            uploadStream.on("error", (error) => {

                console.error(
                    "Upload Stream Error:",
                    error
                );

                reject(error);

            });


            uploadStream.end(req.file.buffer);

        });


        // ==========================================
        // Save URL
        // ==========================================

        user.profileImage = result.secure_url;

        await user.save();


        // ==========================================
        // Response
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "Profile image uploaded successfully",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: user.role,

                profileImage:
                    user.profileImage

            }

        });


    } catch (error) {

        console.error(
            "Profile Image Upload Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to upload profile image",

            error: error.message

        });

    }
};








// =====================================================
// TEST CLOUDINARY
// =====================================================

export const testCloudinary = async (req, res) => {
    try {

        const result = await cloudinary.api.ping();

        return res.status(200).json({
            success: true,
            message: "Cloudinary connected successfully",
            result
        });

    } catch (error) {

        console.error("Cloudinary Test Error:", error);

        return res.status(500).json({
            success: false,
            message: "Cloudinary connection failed",
            error: error.message
        });
    }
};
