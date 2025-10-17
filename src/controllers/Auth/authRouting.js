import express from "express"
import { asyncHandler } from "../../utilis/ErrorHandling.js"
import * as authController from "./authController.js"
import { authMiddleware, roles } from "../../middleWare/authMiddleware.js"
const router = express.Router()

router.post("/signup", asyncHandler(authController.signup))
router.post("/login", asyncHandler(authController.login))
router.post("/forget-password", asyncHandler(authController.forgotPassword))
router.post("/reset-password", asyncHandler(authController.resetPassword))
router.patch("/update-profile", authMiddleware([roles.Admin]), asyncHandler(authController.updateProfile))
router.patch("/:userId/delete-profile", authMiddleware([roles.Admin]), asyncHandler(authController.deleteProfile))
// router.post("/refresh-access-token", asyncHandler(authController.refreshAccessToken))
// router.post("/logout", asyncHandler(authController.logout))


export default router