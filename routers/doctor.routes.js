
import express from "express";

import {
    createDoctorProfile,
    getMyDoctorProfile,
    updateDoctorProfile,
    getDoctorById,
    getAllDoctors,
    deleteDoctorProfile,
} from "../controllers/doctor.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// ================= PROTECTED ROUTES =================

// Create Doctor Profile
router.post("/", protect, createDoctorProfile);

// Get Own Doctor Profile
router.get("/me", protect, getMyDoctorProfile);

// Update Own Doctor Profile
router.patch("/me", protect, updateDoctorProfile);

// Delete Own Doctor Profile
router.delete("/me", protect, deleteDoctorProfile);


// ================= PUBLIC ROUTES =================

// Get All Doctors
router.get("/", getAllDoctors);

// Get Doctor By ID
router.get("/:id", getDoctorById);


export default router;

