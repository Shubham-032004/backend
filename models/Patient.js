import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
    {
        // Patient ka User account
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Personal Information
        dateOfBirth: {
            type: Date
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"]
        },

        bloodGroup: {
            type: String,
            enum: [
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-"
            ]
        },

        // Address
        address: {
            street: {
                type: String,
                trim: true
            },

            city: {
                type: String,
                trim: true
            },

            state: {
                type: String,
                trim: true
            },

            pincode: {
                type: String,
                trim: true
            },

            country: {
                type: String,
                default: "India"
            }
        },

        // Emergency Contact
        emergencyContact: {
            name: {
                type: String,
                trim: true
            },

            relationship: {
                type: String,
                trim: true
            },

            phone: {
                type: String,
                trim: true
            }
        },

        // Medical Information
        allergies: [
            {
                type: String,
                trim: true
            }
        ],

        chronicConditions: [
            {
                type: String,
                trim: true
            }
        ],

        currentMedications: [
            {
                name: {
                    type: String,
                    trim: true
                },

                dosage: {
                    type: String,
                    trim: true
                },

                frequency: {
                    type: String,
                    trim: true
                }
            }
        ],

        // Basic medical history
        pastSurgeries: [
            {
                name: {
                    type: String,
                    trim: true
                },

                date: {
                    type: Date
                }
            }
        ],

        familyMedicalHistory: [
            {
                condition: {
                    type: String,
                    trim: true
                },

                relation: {
                    type: String,
                    trim: true
                }
            }
        ],

        // Profile
        profileImage: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;