
import express from "express";

import {
    createAvailability,
    getMyAvailabilities,
    getDoctorAvailabilities,
    updateAvailability,
    deleteAvailability
} from "../controllers/doctorAvailability.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createAvailability);

router.get("/me", protect, getMyAvailabilities);

router.get("/doctor/:doctorId", getDoctorAvailabilities);

router.patch("/:id", protect, updateAvailability);

router.delete("/:id", protect, deleteAvailability);

export default router;

