
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    // Doctor ka User account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Professional Information
    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: [
      {
        degree: {
          type: String,
          required: true,
          trim: true,
        },

        university: {
          type: String,
          trim: true,
        },

        year: {
          type: Number,
          min: 1950,
          max: new Date().getFullYear(),
        },
      },
    ],

    experienceYears: {
      type: Number,
      min: 0,
      max: 70,
    },

    medicalLicenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // Consultation Fee
    consultationFee: {
      type: Number,
      min: 0,
    },

    // Professional Bio
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Languages spoken by doctor
    languages: [
      {
        type: String,
        trim: true,
      },
    ],

    // Doctor verification
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;

