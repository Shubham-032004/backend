import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        // 1. Check Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. No token provided."
            });
        }

        // 2. Get token
        const token = authHeader.split(" ")[1];

        // 3. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 4. Find user
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists."
            });
        }

        // 5. Check tokenVersion
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({
                success: false,
                message: "Token is no longer valid. Please login again."
            });
        }

        // 6. Attach user information to request
        req.user = {
            id: user._id,
            role: user.role
        };

        // 7. Continue to controller
        next();

    } catch (error) {

        console.error("Auth Middleware Error:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed."
        });
    }
};