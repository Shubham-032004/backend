import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routers/auth.routes.js";
import patientRoutes from "./routers/patient.routes.js";
import doctorRoutes from "./routers/doctor.routes.js";
import hospitalRoutes from "./routers/hospital.routes.js"
import doctorAvailabilityRoutes from "./routers/doctorAvailability.routes.js";
import appointmentRoutes from "./routers/appointment.routes.js";
import MedicalRecordRoutes from "./routers/MedicalRecord.routes.js"
const app = express();

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// ROUTES
// =====================================================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/hospital",hospitalRoutes)
app.use("/api/v1/availability",doctorAvailabilityRoutes)
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/MedicalRecord",MedicalRecordRoutes)

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Medical Booking API is running",
  });
});

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});