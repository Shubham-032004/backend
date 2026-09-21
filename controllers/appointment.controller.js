
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import DoctorAvailability from "../models/DoctorAvailability.js";

// =====================================================
// CREATE APPOINTMENT - PATIENT
// =====================================================

export const createAppointment = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            availability,
            appointmentDate,
            startTime,
            endTime,
            reason
        } = req.body;

        // ================= VALIDATE REQUIRED FIELDS =================

        if (
            !availability ||
            !appointmentDate ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Availability, appointment date, start time and end time are required"
            });
        }

        // ================= FIND PATIENT =================

        const patient = await Patient.findOne({
            user: userId
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        // ================= FIND AVAILABILITY =================

        const doctorAvailability = await DoctorAvailability
            .findOne({
                _id: availability,
                isActive: true
            })
            .populate("doctor")
            .populate("hospital");

        if (!doctorAvailability) {
            return res.status(404).json({
                success: false,
                message: "Doctor availability not found or inactive"
            });
        }

        // ================= CHECK DATE =================

        const date = new Date(appointmentDate);

        if (isNaN(date.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date"
            });
        }

        // ================= CHECK DAY =================

        const days = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday"
        ];

        const appointmentDay = days[date.getDay()];

        if (appointmentDay !== doctorAvailability.day) {
            return res.status(400).json({
                success: false,
                message:
                    `Doctor is not available on ${appointmentDay}`
            });
        }

        // ================= CHECK TIME =================

        if (
            startTime < doctorAvailability.startTime ||
            endTime > doctorAvailability.endTime
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Selected time is outside doctor's availability"
            });
        }

        // ================= CHECK DOUBLE BOOKING =================

        const existingAppointment = await Appointment.findOne({
            doctor: doctorAvailability.doctor._id,
            appointmentDate: date,
            startTime,
            status: {
                $in: ["pending", "confirmed"]
            }
        });

        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        // ================= CREATE =================

        const appointment = await Appointment.create({
            patient: patient._id,
            doctor: doctorAvailability.doctor._id,
            hospital: doctorAvailability.hospital._id,
            availability: doctorAvailability._id,

            appointmentDate: date,

            startTime,
            endTime,

            consultationType:
                doctorAvailability.consultationType,

            consultationFee:
                doctorAvailability.doctor.consultationFee || 0,

            reason,

            status: "pending",
            paymentStatus: "pending"
        });

        // ================= POPULATE RESPONSE =================

        const populatedAppointment = await Appointment
            .findById(appointment._id)
            .populate("patient")
            .populate("doctor")
            .populate("hospital")
            .populate("availability");

        return res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            appointment: populatedAppointment
        });

    } catch (error) {
        console.error("Create Appointment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// GET MY APPOINTMENTS - PATIENT
// =====================================================

export const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;

        // ================= FIND PATIENT =================

        const patient = await Patient.findOne({
            user: userId
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        // ================= GET APPOINTMENTS =================

        const appointments = await Appointment
            .find({
                patient: patient._id
            })
            .populate(
                "doctor",
                "specialization experienceYears consultationFee bio languages"
            )
            .populate(
                "hospital",
                "name address phone"
            )
            .populate(
                "availability",
                "day startTime endTime consultationType"
            )
            .sort({
                appointmentDate: 1,
                startTime: 1
            });

        return res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error("Get My Appointments Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// GET DOCTOR'S APPOINTMENTS - DOCTOR
// =====================================================

export const getDoctorAppointments = async (req, res) => {
    try {
        const userId = req.user.id;

        // ================= FIND DOCTOR =================

        const doctor = await Doctor.findOne({
            user: userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        // ================= GET DOCTOR APPOINTMENTS =================

        const appointments = await Appointment
            .find({
                doctor: doctor._id
            })
            .populate({
                path: "patient",
                populate: {
                    path: "user",
                    select: "name email phone profileImage"
                }
            })
            .populate(
                "hospital",
                "name address phone"
            )
            .populate(
                "availability",
                "day startTime endTime consultationType"
            )
            .sort({
                appointmentDate: 1,
                startTime: 1
            });

        return res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error(
            "Get Doctor Appointments Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// GET ALL APPOINTMENTS - ADMIN
// =====================================================

export const getAllAppointments = async (req, res) => {
    try {

        const appointments = await Appointment
            .find()
            .populate({
                path: "patient",
                populate: {
                    path: "user",
                    select: "name email phone profileImage"
                }
            })
            .populate(
                "doctor",
                "specialization experienceYears consultationFee bio languages"
            )
            .populate(
                "hospital",
                "name address phone"
            )
            .populate(
                "availability",
                "day startTime endTime consultationType"
            )
            .sort({
                appointmentDate: 1,
                startTime: 1
            });

        return res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error(
            "Get All Appointments Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// GET APPOINTMENT BY ID - PATIENT
// =====================================================

export const getAppointmentById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // ================= FIND PATIENT =================

        const patient = await Patient.findOne({
            user: userId
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        // ================= FIND APPOINTMENT =================

        const appointment = await Appointment
            .findOne({
                _id: id,
                patient: patient._id
            })
            .populate(
                "doctor",
                "specialization experienceYears consultationFee bio languages"
            )
            .populate(
                "hospital",
                "name address phone"
            )
            .populate(
                "availability",
                "day startTime endTime consultationType"
            );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        return res.status(200).json({
            success: true,
            appointment
        });

    } catch (error) {
        console.error("Get Appointment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// CANCEL APPOINTMENT - PATIENT
// =====================================================

export const cancelAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const {
            cancellationReason
        } = req.body;

        // ================= FIND PATIENT =================

        const patient = await Patient.findOne({
            user: userId
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        // ================= FIND APPOINTMENT =================

        const appointment = await Appointment.findOne({
            _id: id,
            patient: patient._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // ================= CHECK STATUS =================

        if (
            appointment.status === "cancelled" ||
            appointment.status === "completed"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Appointment cannot be cancelled because it is already ${appointment.status}`
            });
        }

        // ================= CANCEL =================

        appointment.status = "cancelled";
        appointment.cancelledAt = new Date();
        appointment.cancelledBy = "patient";
        appointment.cancellationReason =
            cancellationReason || "";

        // ================= PAYMENT =================

        if (appointment.paymentStatus === "paid") {
            appointment.paymentStatus = "refunded";
        }

        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully",
            appointment
        });

    } catch (error) {
        console.error("Cancel Appointment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

