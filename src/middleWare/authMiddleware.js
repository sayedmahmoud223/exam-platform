import { userModel } from "../../DB/models/user.model.js";
import { ResError } from "../utilis/ErrorHandling.js";
import { methodsWillUsed } from "../utilis/methodsWillUse.js";

export const roles = {
    STUDENT: "STUDENT",
    TEACHER: "TEACHER",
    Admin: "ADMIN",
}

export const authMiddleware = (roles = []) => {
    return (async (req, res, next) => {
        const { token } = req.headers
        if (!token) return next(new ResError("Authentication required. Please login.", 401));
        const payload = methodsWillUsed.verifyToken({ token })
        const user = await userModel.findById({ _id: payload.id })
        if (!user) return next(new ResError("User not found", 400));
        if (!roles.includes(user.role)) return next(new ResError("Access denied. Unauthorized role.", 403));
        req.user = { id: user.id, role: user.role, email: user.email }
        return next()
    })
}