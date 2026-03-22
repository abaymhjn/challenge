const express = require("express");
const router = express.Router();
const studentController = require("./students-controller");
const { checkApiAccess } = require("../../middlewares");
const { validateRequest } = require("../../utils/validate-request");
const { StudentSchema, StudentFilterSchema, StudentStatusSchema } = require("./students-schema");

router.get("", checkApiAccess, validateRequest(StudentFilterSchema), studentController.handleGetAllStudents);
router.post("", checkApiAccess, validateRequest(StudentSchema), studentController.handleAddStudent);
router.get("/:id", checkApiAccess, studentController.handleGetStudentDetail);
router.post("/:id/status", checkApiAccess, validateRequest(StudentStatusSchema), studentController.handleStudentStatus);
router.put("/:id", checkApiAccess, validateRequest(StudentSchema), studentController.handleUpdateStudent);

module.exports = { studentsRoutes: router };
