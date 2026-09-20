
import Hospital from "../models/Hospital.js";

// ================= CREATE HOSPITAL =================

export const createHospital = async (req, res) => {
    try {
        const {
            name,
            address,
            phone,
            email
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Hospital name is required"
            });
        }

        const hospital = await Hospital.create({
            name,
            address,
            phone,
            email
        });

        return res.status(201).json({
            success: true,
            message: "Hospital created successfully",
            hospital
        });

    } catch (error) {
        console.error("Create Hospital Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET ALL HOSPITALS =================

export const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital
            .find({ isActive: true })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: hospitals.length,
            hospitals
        });

    } catch (error) {
        console.error("Get All Hospitals Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET HOSPITAL BY ID =================

export const getHospitalById = async (req, res) => {
    try {
        const { id } = req.params;

        const hospital = await Hospital.findOne({
            _id: id,
            isActive: true
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            hospital
        });

    } catch (error) {
        console.error("Get Hospital By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= UPDATE HOSPITAL =================

export const updateHospital = async (req, res) => {
    try {
        const { id } = req.params;

        const allowedFields = [
            "name",
            "address",
            "phone",
            "email"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const hospital = await Hospital.findByIdAndUpdate(
            id,
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Hospital updated successfully",
            hospital
        });

    } catch (error) {
        console.error("Update Hospital Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= DELETE HOSPITAL =================

export const deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete
        const hospital = await Hospital.findByIdAndUpdate(
            id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Hospital deleted successfully"
        });

    } catch (error) {
        console.error("Delete Hospital Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

