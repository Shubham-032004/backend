import Department from "../models/Department.js";

// ==========================================
// CREATE DEPARTMENT
// ==========================================

export const createDepartment = async (req, res) => {
    try {
        const {
            name,
            slug,
            icon,
            blurb,
            treats
        } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Name and slug are required"
            });
        }

        const existingDepartment = await Department.findOne({
            $or: [
                { name },
                { slug }
            ]
        });

        if (existingDepartment) {
            return res.status(409).json({
                success: false,
                message: "Department with this name or slug already exists"
            });
        }

        const department = await Department.create({
            name,
            slug,
            icon,
            blurb,
            treats
        });

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            department
        });

    } catch (error) {
        console.error("Create Department Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create department",
            error: error.message
        });
    }
};


// ==========================================
// GET ALL DEPARTMENTS
// ==========================================

export const getDepartments = async (req, res) => {
    try {

        const departments = await Department.find()
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            count: departments.length,
            departments
        });

    } catch (error) {
        console.error("Get Departments Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch departments",
            error: error.message
        });
    }
};


// ==========================================
// GET ACTIVE DEPARTMENTS
// ==========================================

export const getActiveDepartments = async (req, res) => {
    try {

        const departments = await Department.find({
            isActive: true
        }).sort({ name: 1 });

        return res.status(200).json({
            success: true,
            count: departments.length,
            departments
        });

    } catch (error) {
        console.error("Get Active Departments Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch active departments",
            error: error.message
        });
    }
};


// ==========================================
// GET DEPARTMENT BY ID
// ==========================================

export const getDepartmentById = async (req, res) => {
    try {

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        return res.status(200).json({
            success: true,
            department
        });

    } catch (error) {
        console.error("Get Department Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch department",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE DEPARTMENT
// ==========================================

export const updateDepartment = async (req, res) => {
    try {

        const {
            name,
            slug,
            icon,
            blurb,
            treats,
            isActive
        } = req.body;

        const department = await Department.findById(
            req.params.id
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        if (name !== undefined) {
            department.name = name;
        }

        if (slug !== undefined) {
            department.slug = slug;
        }

        if (icon !== undefined) {
            department.icon = icon;
        }

        if (blurb !== undefined) {
            department.blurb = blurb;
        }

        if (treats !== undefined) {
            department.treats = treats;
        }

        if (isActive !== undefined) {
            department.isActive = isActive;
        }

        await department.save();

        return res.status(200).json({
            success: true,
            message: "Department updated successfully",
            department
        });

    } catch (error) {
        console.error("Update Department Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update department",
            error: error.message
        });
    }
};


// ==========================================
// DELETE DEPARTMENT
// ==========================================

export const deleteDepartment = async (req, res) => {
    try {

        const department = await Department.findById(
            req.params.id
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        await department.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully"
        });

    } catch (error) {
        console.error("Delete Department Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete department",
            error: error.message
        });
    }
};