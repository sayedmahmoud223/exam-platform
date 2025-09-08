import { levelModel } from "../../../DB/models/level.model.js";
import { userModel } from "../../../DB/models/user.model.js";
import { ApiFeatures } from "../../utilis/apiFeatures.js";
import { ResError } from "../../utilis/ErrorHandling.js";


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
        data: { id, email, name, level: createLevels.title, description: createLevels.description }
    });

}

export const deleteTeacherLevel = async (req, res, next) => {
    const { levelId } = req.params;

    const level = await levelModel.findByIdAndDelete(levelId);
    console.log(level);

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

    const levels = await levelModel.find({teacher:teacherId});

    if (!levels) {
        return next(new ResError("teacher doesn`t have levels", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Fetched successfully",
        data: { levels }
    });
};

