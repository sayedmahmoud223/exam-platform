import express from "express"
import { authMiddleware, roles } from "../../middleWare/authMiddleware.js"
import * as adminController from "./adminController.js"
import { asyncHandler } from "../../utilis/ErrorHandling.js"
import { fileType, fileUpload } from "../../utilis/multer.js"
const router = express.Router()

router.get("/users", authMiddleware(roles.Admin), asyncHandler(adminController.getAllUsers))
router.patch("/teacher/:teacherId", authMiddleware(roles.Admin), asyncHandler(adminController.teacherApproval))
router.post("/teacher/:teacherId/levels", authMiddleware(roles.Admin), asyncHandler(adminController.createTeacherLevels))
router.get("/teacher/:teacherId/levels", authMiddleware(roles.Admin), asyncHandler(adminController.getTeacherLevels))
router.delete("/level/:levelId", authMiddleware(roles.Admin), asyncHandler(adminController.deleteTeacherLevel))
router.patch("/assign-student/:studentId/teacher/:teacherId", authMiddleware(roles.Admin), asyncHandler(adminController.assignStudentToTeacher))
router.patch("/remove-student/:studentId/teacher/:teacherId", authMiddleware(roles.Admin), asyncHandler(adminController.removeTeacherFromStudent))
router.get("/teacher/:teacherId/students", authMiddleware(roles.Admin), asyncHandler(adminController.getTeacherStudents))
router.post("/upload-exam/teacher/:teacherId/level/:levelId", authMiddleware(roles.Admin),fileUpload(fileType.excel).single("excelSheet"), asyncHandler(adminController.uploadExamForLevel))


export default router