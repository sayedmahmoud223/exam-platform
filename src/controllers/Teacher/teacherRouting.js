import express from "express"
import { roles } from "../../middleWare/authMiddleware.js"
import *as teacherController from "./teacherController.js"
import { asyncHandler } from "../../utilis/ErrorHandling.js"
import { authMiddleware } from "../../middleWare/authMiddleware.js"
const router = express.Router()

router.get("/students", authMiddleware([roles.TEACHER]), asyncHandler(teacherController.getAllTeacherStudents))
router.get("/student/:studentId", authMiddleware([roles.TEACHER]), asyncHandler(teacherController.getStudentDetails))
router.get("/levels", authMiddleware([roles.TEACHER]), asyncHandler(teacherController.getAllTeacherLevels))
router.get("/exams", authMiddleware([roles.TEACHER]), asyncHandler(teacherController.getAllTeacherExams))
router.patch("/:examId/assign-student/:studentId", authMiddleware([roles.TEACHER]), asyncHandler(teacherController.assignStudentToExam))
router.get("/exam_students/:examId", authMiddleware([roles.TEACHER]), asyncHandler(teacherController.getAllExamStudents))
// router.get("/level_students/:levelId", authMiddleware([roles.TEACHER]), asyncHandler(teacherController.getAllLevelStudents))


export default router