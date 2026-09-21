
import express from "express";

import {
    createMedicalRecord,
    getMyMedicalRecords,
    getMedicalRecordById
} from "../controllers/medicalRecord.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Doctor creates medical record
router.post("/", protect, createMedicalRecord);

// Patient gets all own medical records
router.get("/my", protect, getMyMedicalRecords);

// Patient gets single medical record
router.get("/:id", protect, getMedicalRecordById);

export default router;

