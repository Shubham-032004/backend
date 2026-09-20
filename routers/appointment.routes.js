
import express from "express";

import {
    createAppointment,
    getMyAppointments,
    getAppointmentById,
    cancelAppointment
} from "../controllers/appointment.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// ================= CREATE APPOINTMENT =================

router.post(
    "/",
    protect,
    createAppointment
);


// ================= GET MY APPOINTMENTS =================

router.get(
    "/my",
    protect,
    getMyAppointments
);


// ================= GET APPOINTMENT BY ID =================

router.get(
    "/:id",
    protect,
    getAppointmentById
);


// ================= CANCEL APPOINTMENT =================

router.patch(
    "/:id/cancel",
    protect,
    cancelAppointment
);


export default router;

