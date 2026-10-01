import express from "express";

import {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    getAppointmentById,
    cancelAppointment,
    updateAppointmentStatus,
    adminCancelAppointment
} from "../controllers/appointment.controller.js";

import {
    protect,
    authorize
} from "../middleware/auth.middleware.js";

const router = express.Router();


// =====================================================
// PATIENT
// =====================================================

// Create
router.post(
    "/",
    protect,
    authorize("patient"),
    createAppointment
);

// My appointments
router.get(
    "/my",
    protect,
    authorize("patient"),
    getMyAppointments
);

// Get specific appointment
router.get(
    "/:id",
    protect,
    authorize("patient"),
    getAppointmentById
);

// Patient cancel
router.patch(
    "/:id/cancel",
    protect,
    authorize("patient"),
    cancelAppointment
);


// =====================================================
// DOCTOR
// =====================================================

// Doctor appointments
router.get(
    "/doctor/my",
    protect,
    authorize("doctor"),
    getDoctorAppointments
);

// Doctor update status
router.patch(
    "/doctor/:id/status",
    protect,
    authorize("doctor"),
    updateAppointmentStatus
);


// =====================================================
// ADMIN
// =====================================================

// All appointments
router.get(
    "/admin/all",
    protect,
    authorize("admin"),
    getAllAppointments
);

// Admin cancel
router.patch(
    "/admin/:id/cancel",
    protect,
    authorize("admin"),
    adminCancelAppointment
);


export default router;