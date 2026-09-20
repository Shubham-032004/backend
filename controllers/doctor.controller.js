import Doctor from "../models/Doctor.js";

// ================= CREATE DOCTOR PROFILE =================

export const createDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if doctor profile already exists
        const existingDoctor = await Doctor.findOne({
            user: userId
        });

        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message: "Doctor profile already exists"
            });
        }

        const doctor = await Doctor.create({
            user: userId,
            ...req.body
        });

        return res.status(201).json({
            success: true,
            message: "Doctor profile created successfully",
            doctor
        });

    } catch (error) {
        console.error("Create Doctor Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET OWN DOCTOR PROFILE =================

export const getMyDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const doctor = await Doctor
            .findOne({ user: userId })
            .populate("user", "name email phone profileImage");

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            doctor
        });

    } catch (error) {
        console.error("Get Doctor Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= UPDATE OWN DOCTOR PROFILE =================

export const updateDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const doctor = await Doctor.findOneAndUpdate(
            { user: userId },
            { $set: req.body },
            {
                new: true,
                runValidators: true
            }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor profile updated successfully",
            doctor
        });

    } catch (error) {
        console.error("Update Doctor Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET DOCTOR BY ID =================

export const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor
            .findById(id)
            .populate("user", "name email phone profileImage");

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        return res.status(200).json({
            success: true,
            doctor
        });

    } catch (error) {
        console.error("Get Doctor By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET ALL DOCTORS =================

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor
            .find()
            .populate("user", "name email phone profileImage");

        return res.status(200).json({
            success: true,
            count: doctors.length,
            doctors
        });

    } catch (error) {
        console.error("Get All Doctors Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= DELETE OWN DOCTOR PROFILE =================

export const deleteDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const doctor = await Doctor.findOneAndDelete({
            user: userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor profile deleted successfully"
        });

    } catch (error) {
        console.error("Delete Doctor Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

