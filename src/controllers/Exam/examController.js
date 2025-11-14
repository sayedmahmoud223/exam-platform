import { examModel } from "../../../DB/models/exam.model.js";
import { userModel } from "../../../DB/models/user.model.js";
import { ApiFeatures } from "../../utilis/apiFeatures.js";
import { ResError } from "../../utilis/ErrorHandling.js";

export const getExamDetails = async (req, res, next) => {
    const { id } = req.params;
    const exam = await examModel.findById(id).select("-teachers -assignedStudents");    
    if (!exam) return next(new ResError("Exam not found", 404));
    return res.status(200).json({
        message: "Exam fetched successfully",
        success: true,
        data: { exam }
    })
}

