import express from "express";

import {
    createPatientProfile,
    getMyPatientProfile,
    updatePatientProfile,
    getPatientById,
    deletePatientProfile
} from "../controllers/patient.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// Create patient profile
router.post("/profile", protect, createPatientProfile);


// Get logged-in patient's profile
router.get("/profile", protect, getMyPatientProfile);


// Update logged-in patient's profile
router.put("/profile", protect, updatePatientProfile);


// Get patient by ID
router.get("/:id", protect, getPatientById);


// Delete logged-in patient's profile
router.delete("/profile", protect, deletePatientProfile);


export default router;