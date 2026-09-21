
import MedicalRecord from "../models/MedicalRecord.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

// Create Medical Record
export const createMedicalRecord = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        const {
            patient,
            appointment,
            symptoms,
            diagnosis,
            notes,
            medicines,
            followUpDate,
            documents
        } = req.body;

        if (!patient || !appointment || !diagnosis) {
            return res.status(400).json({
                success: false,
                message: "Patient, appointment and diagnosis are required"
            });
        }

        // Check appointment
        const existingAppointment = await Appointment.findOne({
            _id: appointment,
            patient: patient,
            doctor: doctor._id
        });

        if (!existingAppointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        const medicalRecord = await MedicalRecord.create({
            patient,
            doctor: doctor._id,
            appointment,
            symptoms,
            diagnosis,
            notes,
            medicines,
            followUpDate,
            documents
        });

        return res.status(201).json({
            success: true,
            message: "Medical record created successfully",
            medicalRecord
        });

    } catch (error) {
        console.error("Create Medical Record Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Patient's Medical Records
export const getMyMedicalRecords = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            user: req.user.id
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        const records = await MedicalRecord.find({
            patient: patient._id
        })
            .populate("doctor", "specialization experienceYears")
            .populate("appointment", "appointmentDate startTime endTime")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: records.length,
            records
        });

    } catch (error) {
        console.error("Get Medical Records Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Single Medical Record
export const getMedicalRecordById = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            user: req.user.id
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        const record = await MedicalRecord.findOne({
            _id: req.params.id,
            patient: patient._id
        })
            .populate("doctor", "specialization experienceYears")
            .populate("appointment", "appointmentDate startTime endTime");

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });
        }

        return res.status(200).json({
            success: true,
            record
        });

    } catch (error) {
        console.error("Get Medical Record Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

