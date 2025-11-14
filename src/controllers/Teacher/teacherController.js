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

export const getTeacherLevels = async (req, res, next) => {
    const apiFeatures = new ApiFeatures(
        levelModel.find({ teachers: { $in: [req.user.id] } }).select("-teachers").populate("exams", "title description group startTime durationMinutes passingScore").select("-password -refreshToken"),
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

export const getTeacherLevelsWithExams = async (req, res, next) => {

    const levels = await levelModel
        .find({ teachers: { $in: [req.user.id] } })
        .select("title description subLevels")
        .lean();

    if (!levels.length) {
        return next(new ResError("Teacher doesn't have any levels", 404));
    }

    const levelIds = levels.map((lvl) => lvl._id);

    const examsGrouped = await examModel.aggregate([
        { $match: { level: { $in: levelIds } } },
        {
            $group: {
                _id: { level: "$level", group: "$group" },
                exams: {
                    $push: {
                        _id: "$_id",
                        title: "$title",
                        description: "$description",
                        startTime: "$startTime",
                        durationMinutes: "$durationMinutes",
                        passingScore: "$passingScore",
                    },
                },
            },
        },
        { $sort: { "_id.group": 1 } },
    ]);

    const result = levels.map((level) => {
        const levelExams = examsGrouped
            .filter((eg) => String(eg._id.level) === String(level._id))
            .map((eg) => ({
                group: eg._id.group,
                exams: eg.exams,
            }));

        return {
            ...level,
            examsGrouped: levelExams,
        };
    });

    return res.status(200).json({
        success: true,
        message: "Fetched successfully",
        data: { levels: result },
    });
};

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

    if (student.level == level._id) {
        return next(new ResError("student already assigned to this level", 403));
    }

    await userModel.findByIdAndUpdate(studentId, {
        level: levelId,
    })

    return res.status(200).json({
        success: true,
        message: "Student assigned to level successfully",
        data: {
            id: student._id,
            name: student.name,
            levelId: level._id,
            levelName: level.title
        },
    });
};
