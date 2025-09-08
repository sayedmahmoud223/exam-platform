import express from "express"
import { authMiddleware, roles } from "../../middleWare/authMiddleware.js"
import * as adminController from "./adminController.js"
import { asyncHandler } from "../../utilis/ErrorHandling.js"
const router = express.Router()

router.get("/users", authMiddleware(roles.Admin), asyncHandler(adminController.getAllUsers))
router.patch("/teacher/:teacherId", authMiddleware(roles.Admin), asyncHandler(adminController.teacherApproval))
router.post("/teacher/:teacherId/levels", authMiddleware(roles.Admin), asyncHandler(adminController.createTeacherLevels))
router.get("/teacher/:teacherId/levels", authMiddleware(roles.Admin), asyncHandler(adminController.getTeacherLevels))
router.delete("/level/:levelId", authMiddleware(roles.Admin), asyncHandler(adminController.deleteTeacherLevel))


export default router