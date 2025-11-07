import { examModel } from "../../../DB/models/exam.model.js";
import { levelModel } from "../../../DB/models/level.model.js";
import { userModel } from "../../../DB/models/user.model.js";
import { roles } from "../../middleWare/authMiddleware.js";
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
        .populate("level", "title description");
    if (!student) return next(new ResError("Student not found", 404));
    return res.status(200).json({
        success: true,
        message: "Fetched successfully",
        data: student
    });

}

export const getAllTeacherLevels = async (req, res, next) => {
    const apiFeatures = new ApiFeatures(levelModel.find({ teachers: { $in: [req.user.id] } }).select("-password -teachers"), req.query, userModel)
        .paginate()
        .filter()
        .search()
        .sort()
        .select();
    const result = await apiFeatures.execute();
    return res.status(200).json(result);
}

export const getAllTeachersLevelsWithExams = async (req, res, next) => {
    // const { levelId } = req.params;

    // const level = await levelModel.findOne({
    //     _id: levelId,
    //     teacher: req.user.id
    // });

    // if (!level) {
    //     return next(new ResError("Level not found or not yours", 404));
    // }

    const apiFeatures = new ApiFeatures(
        levelModel.find({ teachers: { $in: [req.user.id] } }).select("-teachers").populate("exams", "title description").select("-password -refreshToken"),
        req.query,
        levelModel
    )
        .paginate()
        .filter()
        .search()
        .sort()
        .select();

    const levelsWithExams = await apiFeatures.execute();

    return res.status(200).json({
        message: "levels with exams fetched successfully",
        count: levelsWithExams.length,
        data: levelsWithExams
    });
}



export const getAllExamStudents = async (req, res, next) => {
    const { examId } = req.params;

    const exam = await examModel.findOne({
        _id: examId,
        teacher: req.user.id
    });

    if (!exam) {
        return next(new ResError("Exam not found or not yours", 404));
    }

    const apiFeatures = new ApiFeatures(
        examModel.find({ _id: examId })
            .select("-questions -teacher")
            .populate("assignedStudents", "name email")
            .select("-password -refreshToken"),
        req.query,
        userModel
    ).paginate()
        .filter()
        .search()
        .sort()
        .select();

    const students = await apiFeatures.execute();

    return res.status(200).json({
        message: "Students fetched successfully",
        students
    });
}


export const assignStudentToLevel = async (req, res, next) => {
    const { studentId, levelId } = req.params;

    const student = await userModel.findById(studentId);
    if (!student || student.role !== "STUDENT") {
        return next(new ResError("Student not found", 404));
    }


    const level = await levelModel.findById(levelId);
    if (!level) return next(new ResError("level not found", 404));

    if (student.level && student.level.toString() === levelId) {
        return next(new ResError("student already assigned to this level", 403));
    }

    await userModel.findByIdAndUpdate(studentId, {
        $addToSet: { level: levelId },
    })

    return res.status(200).json({
        success: true,
        message: "Student assigned to level successfully",
        data: {
            id: updatedStudent._id,
            name: updatedStudent.name,
            exams: updatedStudent.openedExams,
        },
    });
};
