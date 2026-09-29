import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true
        },

        icon: {
            type: String,
            default: "Stethoscope"
        },

        blurb: {
            type: String,
            trim: true
        },

        treats: [
            {
                type: String,
                trim: true
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;