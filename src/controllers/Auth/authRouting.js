import express from "express"
import { asyncHandler } from "../../utilis/ErrorHandling.js"
import * as authController from "./authController.js"
const router = express.Router()

router.post("/signup", asyncHandler(authController.signup))
router.post("/login", asyncHandler(authController.login))
router.post("/refresh-access-token", asyncHandler(authController.refreshAccessToken))
router.post("/logout", asyncHandler(authController.logout))

export default router