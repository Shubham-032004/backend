import express from "express";

import {
    createDepartment,
    getDepartments,
    getActiveDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} from "../controllers/department.controller.js";



import {
    protect,
    authorize
} from "../middleware/auth.middleware.js";

const router = express.Router();


// Public
router.get("/", getDepartments);

router.get("/active", getActiveDepartments);

router.get("/:id", getDepartmentById);


// Admin
router.post(
    "/",
    protect,
    authorize("admin"),
    createDepartment
);

router.patch(
    "/:id",
    protect,
    authorize("admin"),
    updateDepartment
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteDepartment
);


export default router;