import { levelModel } from "../../../DB/models/level.model.js";
import { userModel } from "../../../DB/models/user.model.js";
import { ApiFeatures } from "../../utilis/apiFeatures.js";
import { ResError } from "../../utilis/ErrorHandling.js";

export const getAllTeacherStudents = async (req, res, next) => {
    const apiFeatures = new ApiFeatures(userModel.find({ teacher: req.user.id }).select("-password"), req.query, userModel)
        .paginate()
        .filter()
        .search()
        .sort()
        .select();
    const result = await apiFeatures.execute();
    return res.status(200).json(result);
}

export const getStudentDetails = async (req, res, next) => {
    const { studentId } = req.params
    const student = await userModel.findOne({ _id: studentId, teacher: { $in: [req.user.id] } }).select("-password -refreshToken -teacher")
    if (!student) return next(new ResError("Student not found", 404));
    return res.status(200).json({
        success: true,
        message: "Fetched successfully",
        data: student
    });

}

export const getAllTeacherLevels = async (req, res, next) => {
    const apiFeatures = new ApiFeatures(levelModel.find({ teacher: req.user.id }).select("-password").populate("exams", "title description"), req.query, userModel)
        .paginate()
        .filter()
        .search()
        .sort()
        .select();
    const result = await apiFeatures.execute();
    return res.status(200).json(result);
}

export const getAllLevelStudents = async (req, res, next) => {
    const { levelId } = req.params;

    const level = await levelModel.findOne({
        _id: levelId,
        teacher: req.user.id
    });

    if (!level) {
        return next(new ResError("Level not found or not yours", 404));
    }

    const apiFeatures = new ApiFeatures(
        levelModel.find({ _id: levelId}).populate("students", "name email").populate("exams", "title description").select("-password -refreshToken"),
        req.query,
        userModel
    )
        .paginate()
        .filter()
        .search()
        .sort()
        .select();

    const students = await apiFeatures.execute();

    return res.status(200).json({
        message: "Students fetched successfully",
        count: students.length,
        students
    });
}