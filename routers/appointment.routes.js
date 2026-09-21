
import express from "express";

import {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    getAppointmentById,
    cancelAppointment
} from "../controllers/appointment.controller.js";

import {
    protect,
    authorize
} from "../middleware/auth.middleware.js";

const router = express.Router();


// ================= CREATE APPOINTMENT =================
// Patient appointment create karega

router.post(
    "/",
    protect,
    authorize("patient"),
    createAppointment
);


// ================= GET MY APPOINTMENTS - PATIENT =================
// Patient apne appointments dekhega

router.get(
    "/my",
    protect,
    authorize("patient"),
    getMyAppointments
);


// ================= GET MY APPOINTMENTS - DOCTOR =================
// Doctor apne saare appointments dekhega

router.get(
    "/doctor/my",
    protect,
    authorize("doctor"),
    getDoctorAppointments
);


// ================= GET ALL APPOINTMENTS - ADMIN =================
// Admin sabhi appointments dekhega

router.get(
    "/admin/all",
    protect,
    authorize("admin"),
    getAllAppointments
);


// ================= GET APPOINTMENT BY ID =================
// Patient apni specific appointment dekhega

router.get(
    "/:id",
    protect,
    authorize("patient"),
    getAppointmentById
);


// ================= CANCEL APPOINTMENT =================
// Patient apni appointment cancel karega

router.patch(
    "/:id/cancel",
    protect,
    authorize("patient"),
    cancelAppointment
);


export default router;

