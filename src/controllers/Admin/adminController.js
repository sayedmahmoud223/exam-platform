import { examModel } from "../../../DB/models/exam.model.js";
import { levelModel } from "../../../DB/models/level.model.js";
import { userModel } from "../../../DB/models/user.model.js";
import { ApiFeatures } from "../../utilis/apiFeatures.js";
import { ResError } from "../../utilis/ErrorHandling.js";
import XLSX from "xlsx";



export const getAllUsers = async (req, res, next) => {
    const apiFeatures = new ApiFeatures(userModel.find().select("-password"), req.query, userModel)
        .paginate()
        .filter()
        .search()
        .sort()
        .select();
    const result = await apiFeatures.execute();
    return res.status(200).json(result);
}

export const teacherApproval = async (req, res, next) => {
    const { teacherId } = req.params;
    const { isActive } = req.body;

    const teacher = await userModel.findById(teacherId);

    if (!teacher) {
        return next(new ResError("User not found", 404));
    }

    if (teacher.role !== "TEACHER") {
        return next(new ResError("User is not a teacher", 400));
    }

    teacher.isActive = isActive;
    await teacher.save();

    const { id, email, isActive: active } = teacher;

    return res.status(200).json({
        success: true,
        message: "Updated successfully",
        data: { id, email, active },
    });

}

export const createTeacherLevels = async (req, res, next) => {
    const { teacherId } = req.params;
    const { title, description } = req.body;

    const teacher = await userModel.findById(teacherId);

    if (!teacher || teacher.role !== "TEACHER") {
        return next(new ResError("Teacher not found", 404));
    }

    const createLevels = await levelModel.create({
        title,
        teacher: teacher.id,
        description
    })
    const { id, email, name } = teacher
    return res.status(201).json({
        success: true,
        message: "Created successfully",
        data: { id:createLevels.id, email, name, level: createLevels.title, description: createLevels.description }
    });

}

export const deleteTeacherLevel = async (req, res, next) => {
    const { levelId } = req.params;

    const level = await levelModel.findByIdAndDelete(levelId, {
        new: true,
        runValidators: true
    });

    if (!level) {
        return next(new ResError("Level not found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Deleted successfully",
        data: { id: level._id, name: level.title }
    });
};

export const updateTeacherLevel = async (req, res, next) => {
    const { levelId } = req.params;

    const level = await levelModel.findByIdAndUpdate(levelId, req.body, {
        new: true,
        runValidators: true
    });

    if (!level) {
        return next(new ResError("Level not found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Updated successfully",
        data: { id: level._id, title: level.title, description: level.description }
    });
};

export const getTeacherLevels = async (req, res, next) => {
    const { teacherId } = req.params;

    const levels = await levelModel.find({ teacher: teacherId });

    if (!levels) {
        return next(new ResError("teacher doesn`t have levels", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Fetched successfully",
        data: { levels }
    });
};

export const assignStudentToTeacher = async (req, res, next) => {
    const { studentId, teacherId } = req.params;
    const { levelId } = req.body;

    const student = await userModel.findById(studentId);
    if (!student || student.role !== "STUDENT") {
        return next(new ResError("Student not found", 404));
    }

    const level = await levelModel.findById(levelId);
    if (!level) return next(new ResError("Level not found", 404))

    const teacher = await userModel.findById(teacherId);
    if (!teacher || teacher.role !== "TEACHER" || !teacher.isActive) {
        return next(new ResError("Teacher not found or not active", 404));
    }

    await userModel.findByIdAndUpdate(studentId, {
        $addToSet: { teacher: teacherId, levels: levelId },
        isActive: true,
    });

    const updatedStudent = await userModel.findById(studentId).populate("teacher", "name email").populate("levels", "title description");

    return res.status(200).json({
        success: true,
        message: "Student assigned to Teacher successfully",
        data: {
            id: updatedStudent._id,
            name: updatedStudent.name,
            teachers: updatedStudent.teacher,
            levels: updatedStudent.levels
        },
    });
};

export const removeTeacherFromStudent = async (req, res, next) => {
    const { studentId, teacherId } = req.params;

    // Validate student
    const student = await userModel.findById(studentId);
    if (!student || student.role !== "STUDENT") {
        return next(new ResError("Student not found", 404));
    }

    // Validate teacher
    const teacher = await userModel.findById(teacherId);
    if (!teacher || teacher.role !== "TEACHER") {
        return next(new ResError("Teacher not found", 404));
    }

    // Remove teacher from student's teachers array
    await userModel.findByIdAndUpdate(studentId, {
        $pull: { teacher: teacher._id },
    });

    const updatedStudent = await userModel.findById(studentId).populate("teacher", "name email");

    return res.status(200).json({
        success: true,
        message: "Teacher removed from student successfully",
        data: {
            id: updatedStudent._id,
            name: updatedStudent.name,
            teachers: updatedStudent.teacher,
        },
    });
};

export const getTeacherStudents = async (req, res, next) => {
    const apiFeatures = new ApiFeatures(userModel.find({ teacher: { $in: [req.params.teacherId] } }).select("-password -refreshToken").populate("teacher", "name email"), req.query, userModel)
        .paginate()
        .filter()
        .search()
        .sort()
        .select();
    const result = await apiFeatures.execute();
    return res.status(200).json(result);
}

export const uploadExamForLevel = async (req, res, next) => {
    const { levelId,teacherId } = req.params;
    const { title, description ,passingScore, durationMinutes} = req.body;

    if (!req.file) {
        return next(new ResError("No file uploaded", 400));
    }

    // check if level exists
    const teacher = await userModel.findById(teacherId);
    if (!teacher) {
        return next(new ResError("Teacher not found", 404));
    }
    const level = await levelModel.findById(levelId);
    if (!level) {
        return next(new ResError("Level not found", 404));
    }

    // read excel buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // first sheet
    const sheet = workbook.Sheets[sheetName];

    // convert to JSON
    const rows = XLSX.utils.sheet_to_json(sheet);
    if (!rows) {
        return next(new ResError("excel sheet has empty rows", 404));
    }

    const questions = rows.map((row) => ({
        questionText: row.questionText,
        options: [row.Option1, row.Option2, row.Option3, row.Option4],
        correctAnswer: row.correctAnswer,
    }));

    let exam = await examModel.create({
        title,
        description,
        level: levelId,
        teacher: teacherId,
        questions,
        durationMinutes,
        passingScore,
        startTime: new Date(),
    });

    return res.status(200).json({
        message: "Exam uploaded successfully",
        data: exam
    });
};
