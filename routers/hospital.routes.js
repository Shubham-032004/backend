import express from "express";

import {
    createHospital,
    getAllHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital
} from "../controllers/hospital.controller.js";

const router = express.Router();


// Create hospital
router.post("/", createHospital);

// Get all hospitals
router.get("/", getAllHospitals);

// Get hospital by ID
router.get("/:id", getHospitalById);

// Update hospital
router.patch("/:id", updateHospital);

// Delete hospital
router.delete("/:id", deleteHospital);


export default router;

