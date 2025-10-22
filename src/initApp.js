import authRouter from "./controllers/Auth/authRouting.js"
import examRouter from "./controllers/Exam/examRouting.js"
import teacherRouter from "./controllers/Teacher/teacherRouting.js"
import studentRouter from "./controllers/Student/studentRouting.js"
import adminRouter from "./controllers/Admin/adminRouting.js"
import levelRouter from "./controllers/Level/levelRouting.js"
import { globalError } from "./utilis/ErrorHandling.js"
import cors from "cors"
import cookieParser from "cookie-parser"

export const initApp = function (app, express) {
    app.use(cors({
        origin: ['http://localhost:3000', "http://localhost:5173"],
        credentials: true,
    }));
    app.use(express.json())
    app.use(cookieParser());
    app.use("/api/v1/auth", authRouter)
    app.use("/api/v1/admin", adminRouter)
    app.use("/api/v1/exam", examRouter)
    app.use("/api/v1/teacher", teacherRouter)
    app.use("/api/v1/level", levelRouter)
    app.get("/", (req, res, next) => {
        res.json({ message: "Hello" })
    })
    app.use(globalError)
}



