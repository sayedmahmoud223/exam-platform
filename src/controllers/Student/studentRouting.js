import express from "express"
import { authMiddleware, roles } from "../../middleWare/authMiddleware.js"
import * as studentController from "./studentController.js"
import { asyncHandler } from "../../utilis/ErrorHandling.js"
const router = express.Router()

router.get("/", authMiddleware(roles.Admin), asyncHandler(studentController.getAllStudents))


export default router