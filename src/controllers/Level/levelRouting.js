import express from "express"
import { roles } from "../../middleWare/authMiddleware.js"
import *as levelController from "./levelController.js"
import { asyncHandler } from "../../utilis/ErrorHandling.js"
import { authMiddleware } from "../../middleWare/authMiddleware.js"
const router = express.Router()

router.get("/", authMiddleware([roles.Admin]), asyncHandler(levelController.getAllLevels))
router.get("/:levelId", authMiddleware([roles.Admin]), asyncHandler(levelController.getLevelDetails))



export default router