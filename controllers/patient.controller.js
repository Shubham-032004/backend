import Patient from "../models/Patient.js";

// ================= CREATE PATIENT PROFILE =================

export const createPatientProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if patient profile already exists
        const existingPatient = await Patient.findOne({
            user: userId
        });

        if (existingPatient) {
            return res.status(400).json({
                success: false,
                message: "Patient profile already exists"
            });
        }

        const patient = await Patient.create({
            user: userId,
            ...req.body
        });

        return res.status(201).json({
            success: true,
            message: "Patient profile created successfully",
            patient
        });

    } catch (error) {
        console.error("Create Patient Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET OWN PATIENT PROFILE =================

export const getMyPatientProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const patient = await Patient
            .findOne({ user: userId })
            .populate("user", "name email phone profileImage");

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            patient
        });

    } catch (error) {
        console.error("Get Patient Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= UPDATE OWN PATIENT PROFILE =================

export const updatePatientProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const patient = await Patient.findOneAndUpdate(
            { user: userId },
            { $set: req.body },
            {
                new: true,
                runValidators: true
            }
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Patient profile updated successfully",
            patient
        });

    } catch (error) {
        console.error("Update Patient Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET PATIENT BY ID =================

export const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;

        const patient = await Patient
            .findById(id)
            .populate("user", "name email phone profileImage");

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        return res.status(200).json({
            success: true,
            patient
        });

    } catch (error) {
        console.error("Get Patient By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= DELETE PATIENT PROFILE =================

export const deletePatientProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const patient = await Patient.findOneAndDelete({
            user: userId
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Patient profile deleted successfully"
        });

    } catch (error) {
        console.error("Delete Patient Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};