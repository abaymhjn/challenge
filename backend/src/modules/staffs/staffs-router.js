const express = require("express");
const router = express.Router();
const staffsController = require("./staffs-controller");
const { validateRequest } = require("../../utils/validate-request");
const { StaffSchema, StaffFilterSchema, StaffStatusSchema } = require("./staffs-schema");

router.get("", validateRequest(StaffFilterSchema), staffsController.handleGetAllStaffs);
router.post("", validateRequest(StaffSchema), staffsController.handleAddStaff);
router.get("/:id", staffsController.handleGetStaff);
router.put("/:id", validateRequest(StaffSchema), staffsController.handleUpdateStaff);
router.post("/:id/status", validateRequest(StaffStatusSchema), staffsController.handleReviewStaffStatus);

module.exports = { staffsRoutes: router };
