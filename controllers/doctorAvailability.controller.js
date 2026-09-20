
import Doctor from "../models/Doctor.js";
import DoctorAvailability from "../models/DoctorAvailability.js";

// ================= CREATE AVAILABILITY =================

export const createAvailability = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            hospital,
            day,
            startTime,
            endTime,
            consultationType
        } = req.body;

        // Find doctor profile
        const doctor = await Doctor.findOne({
            user: userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        // Create availability
        const availability = await DoctorAvailability.create({
            doctor: doctor._id,
            hospital,
            day,
            startTime,
            endTime,
            consultationType
        });

        return res.status(201).json({
            success: true,
            message: "Doctor availability created successfully",
            availability
        });

    } catch (error) {
        console.error("Create Availability Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET MY AVAILABILITIES =================

export const getMyAvailabilities = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find doctor profile
        const doctor = await Doctor.findOne({
            user: userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        const availabilities = await DoctorAvailability
            .find({ doctor: doctor._id })
            .populate("hospital", "name address phone")
            .sort({ day: 1, startTime: 1 });

        return res.status(200).json({
            success: true,
            count: availabilities.length,
            availabilities
        });

    } catch (error) {
        console.error("Get My Availabilities Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET DOCTOR AVAILABILITIES =================

export const getDoctorAvailabilities = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const availabilities = await DoctorAvailability
            .find({
                doctor: doctorId,
                isActive: true
            })
            .populate("hospital", "name address phone")
            .sort({ day: 1, startTime: 1 });

        return res.status(200).json({
            success: true,
            count: availabilities.length,
            availabilities
        });

    } catch (error) {
        console.error("Get Doctor Availabilities Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= UPDATE AVAILABILITY =================

export const updateAvailability = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Find doctor profile
        const doctor = await Doctor.findOne({
            user: userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        // Update only doctor's own availability
        const availability = await DoctorAvailability.findOneAndUpdate(
            {
                _id: id,
                doctor: doctor._id
            },
            {
                $set: req.body
            },
            {
                new: true,
                runValidators: true
            }
        ).populate("hospital", "name address phone");

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: "Availability not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Availability updated successfully",
            availability
        });

    } catch (error) {
        console.error("Update Availability Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= DELETE AVAILABILITY =================

export const deleteAvailability = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Find doctor profile
        const doctor = await Doctor.findOne({
            user: userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        // Delete only doctor's own availability
        const availability = await DoctorAvailability.findOneAndDelete({
            _id: id,
            doctor: doctor._id
        });

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: "Availability not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Availability deleted successfully"
        });

    } catch (error) {
        console.error("Delete Availability Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

