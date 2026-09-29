import Doctor from "../models/Doctor.js";

import Department from "../models/Department.js";

// ================= CREATE DOCTOR PROFILE ==================

export const createDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if doctor profile already exists
        const existingDoctor = await Doctor.findOne({
            user: userId
        });

        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message: "Doctor profile already exists"
            });
        }

        const doctor = await Doctor.create({
            user: userId,
            ...req.body
        });

        return res.status(201).json({
            success: true,
            message: "Doctor profile created successfully",
            doctor
        });

    } catch (error) {
        console.error("Create Doctor Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET OWN DOCTOR PROFILE =================

export const getMyDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const doctor = await Doctor
            .findOne({ user: userId })
            .populate("user", "name email phone profileImage");

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            doctor
        });

    } catch (error) {
        console.error("Get Doctor Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= UPDATE OWN DOCTOR PROFILE =================

export const updateDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const doctor = await Doctor.findOneAndUpdate(
            { user: userId },
            { $set: req.body },
            {
                new: true,
                runValidators: true
            }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor profile updated successfully",
            doctor
        });

    } catch (error) {
        console.error("Update Doctor Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET DOCTOR BY ID =================

export const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor
            .findById(id)
            .populate("user", "name email phone profileImage");

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        return res.status(200).json({
            success: true,
            doctor
        });

    } catch (error) {
        console.error("Get Doctor By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= GET ALL DOCTORS =================

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor
            .find()
            .populate("user", "name email phone profileImage");

        return res.status(200).json({
            success: true,
            count: doctors.length,
            doctors
        });

    } catch (error) {
        console.error("Get All Doctors Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ================= DELETE OWN DOCTOR PROFILE =================

export const deleteDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const doctor = await Doctor.findOneAndDelete({
            user: userId
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor profile deleted successfully"
        });

    } catch (error) {
        console.error("Delete Doctor Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};









// ==========================================
// SEARCH DOCTORS
// ==========================================

export const searchDoctors = async (req, res) => {
    try {
        const {
            department: departmentSlug,
            day,
            q,
            hospital,
            page = 1,
            limit = 10
        } = req.query;


        // ==========================================
        // 1. ONLY APPROVED DOCTORS
        // ==========================================

        const match = {
            isApproved: true
        };


        // ==========================================
        // 2. DEPARTMENT SLUG
        // ==========================================

        if (departmentSlug) {

            const department = await Department.findOne({
                slug: departmentSlug.toLowerCase().trim()
            }).select("_id");


            // Wrong slug
            if (!department) {
                return res.status(200).json({
                    success: true,
                    doctors: [],
                    total: 0
                });
            }


            // Filter Doctor by Department ID
            match.department = department._id;
        }


        // ==========================================
        // 3. PAGINATION
        // ==========================================

        const currentPage = Math.max(
            parseInt(page) || 1,
            1
        );

        const currentLimit = Math.min(
            parseInt(limit) || 10,
            50
        );

        const skip =
            (currentPage - 1) * currentLimit;


        // ==========================================
        // 4. AGGREGATION
        // ==========================================

        const pipeline = [

            // Approved + department
            {
                $match: match
            },


            // ======================================
            // USER LOOKUP
            // ======================================

            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },

            {
                $unwind: "$user"
            },


            // ======================================
            // DEPARTMENT LOOKUP
            // ======================================

            {
                $lookup: {
                    from: "departments",
                    localField: "department",
                    foreignField: "_id",
                    as: "department"
                }
            },

            {
                $unwind: "$department"
            },


            // ======================================
            // AVAILABILITY LOOKUP
            // ======================================

            {
                $lookup: {
                    from: "doctoravailabilities",

                    let: {
                        doctorId: "$_id"
                    },

                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        "$doctor",
                                        "$$doctorId"
                                    ]
                                },

                                isActive: true
                            }
                        }
                    ],

                    as: "availability"
                }
            }
        ];


        // ==========================================
        // 5. DAY FILTER
        // ==========================================

        if (day) {

            const normalizedDay =
                day.toLowerCase().trim();


            if (
                normalizedDay === "today" ||
                normalizedDay === "tomorrow" ||
                normalizedDay === "dayafter" ||
                normalizedDay === "day-after"
            ) {

                const targetDate = new Date();


                if (normalizedDay === "tomorrow") {
                    targetDate.setDate(
                        targetDate.getDate() + 1
                    );
                }


                if (
                    normalizedDay === "dayafter" ||
                    normalizedDay === "day-after"
                ) {
                    targetDate.setDate(
                        targetDate.getDate() + 2
                    );
                }


                const weekday =
                    targetDate
                        .toLocaleDateString(
                            "en-US",
                            {
                                weekday: "long"
                            }
                        )
                        .toLowerCase();


                // Example:
                // Monday → monday

                pipeline.push({
                    $match: {
                        "availability.day": weekday
                    }
                });
            }
        }


        // ==========================================
        // 6. SEARCH TEXT
        // ==========================================

        if (q && q.trim()) {

            const searchRegex =
                new RegExp(
                    q.trim(),
                    "i"
                );


            pipeline.push({
                $match: {
                    $or: [
                        {
                            "user.name": searchRegex
                        },
                        {
                            specialization:
                                searchRegex
                        },
                        {
                            "department.name":
                                searchRegex
                        }
                    ]
                }
            });
        }


        // ==========================================
        // 7. HOSPITAL LOOKUP
        // ==========================================

        pipeline.push({

            $lookup: {
                from: "hospitals",

                let: {
                    availabilityHospitalIds:
                        "$availability.hospital"
                },

                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    "$_id",
                                    "$$availabilityHospitalIds"
                                ]
                            }
                        }
                    }
                ],

                as: "hospitals"
            }

        });


        // ==========================================
        // 8. HOSPITAL SEARCH
        // ==========================================

        if (hospital && hospital.trim()) {

            const hospitalRegex =
                new RegExp(
                    hospital.trim(),
                    "i"
                );


            pipeline.push({
                $match: {
                    $or: [
                        {
                            "hospitals.name":
                                hospitalRegex
                        },
                        {
                            "hospitals.address.city":
                                hospitalRegex
                        }
                    ]
                }
            });
        }


        // ==========================================
        // 9. SORT
        // ==========================================

        pipeline.push({
            $sort: {
                experienceYears: -1,
                _id: 1
            }
        });


        // ==========================================
        // 10. PAGINATION + TOTAL
        // ==========================================

        pipeline.push({

            $facet: {

                doctors: [
                    {
                        $skip: skip
                    },
                    {
                        $limit: currentLimit
                    }
                ],

                total: [
                    {
                        $count: "count"
                    }
                ]

            }

        });


        // ==========================================
        // 11. EXECUTE
        // ==========================================

        const result =
            await Doctor.aggregate(pipeline);


        const doctors =
            result[0]?.doctors || [];


        const total =
            result[0]?.total?.[0]?.count || 0;


        // ==========================================
        // 12. RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,
            doctors,
            total
        });


    } catch (error) {

        console.error(
            "Search Doctors Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to search doctors",
            error: error.message
        });
    }
};



// ================= SPECIALIZATION COUNT =================

export const getSpecializationCounts = async (req, res) => {
    try {

        const specializations = await Doctor.aggregate([
            {
                $match: {
                    isApproved: true
                }
            },

            {
                $group: {
                    _id: "$specialization",
                    count: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    count: -1
                }
            },

            {
                $project: {
                    _id: 0,
                    specialization: "$_id",
                    count: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            specializations
        });

    } catch (error) {

        console.error(
            "Get Specialization Counts Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get specialization counts"
        });
    }
};
