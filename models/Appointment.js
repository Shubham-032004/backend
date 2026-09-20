import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Patient jisne appointment book ki
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Doctor jiske saath appointment hai
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Appointment kis hospital mein hai
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    // Doctor ki selected availability
    availability: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorAvailability",
      required: true,
    },

    // Appointment date
    appointmentDate: {
      type: Date,
      required: true,
    },

    // Appointment ka start/end time
    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    // Consultation type
    consultationType: {
      type: String,
      enum: ["in-person", "online"],
      required: true,
    },

    // Appointment status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
    },

    // Patient ka reason
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Doctor/patient ke liye notes
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Consultation fee
    consultationFee: {
      type: Number,
      min: 0,
      required: true,
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

export default Appointment;

