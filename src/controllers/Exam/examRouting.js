import express from "express"
import { roles } from "../../middleWare/authMiddleware.js"
import *as examController from "./examController.js"
import { asyncHandler } from "../../utilis/ErrorHandling.js"
import { authMiddleware } from "../../middleWare/authMiddleware.js"
const router = express.Router()

router.get("/:id", authMiddleware([roles.TEACHER,roles.Admin]), asyncHandler(examController.getExamDetails))


export default router