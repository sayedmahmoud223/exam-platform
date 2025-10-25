import { Types } from "mongoose";
import { examModel } from "../../../DB/models/exam.model.js";
import { levelModel } from "../../../DB/models/level.model.js";
import { userModel } from "../../../DB/models/user.model.js";
import { ApiFeatures } from "../../utilis/apiFeatures.js";
import { ResError } from "../../utilis/ErrorHandling.js";

export const getAllLevels = async (req, res, next) => {
    const apiFeatures = new ApiFeatures(levelModel.find(), req.query, levelModel)
        .paginate()
        .filter()
        .search()
        .sort()
        .select();
    const result = await apiFeatures.execute();
    return res.status(200).json(result);
}

export const getLevelDetails = async (req, res, next) => {
    const { levelId } = req.params;

    const level = await levelModel
        .findById(levelId)
        .populate("teachers", "name email")
        .select("-__v");

    if (!level) return next(new ResError("Level not found", 404));

    const grouped = await examModel.aggregate([
        { $match: { level: new Types.ObjectId(levelId) } },
        { $project: { title: 1, description: 1, startTime: 1, group: { $ifNull: ["$group", "Ungrouped"] } } },
        {
            $group: {
                _id: "$group",
                exams: { $push: { _id: "$_id", title: "$title", description: "$description", startTime: "$startTime" } },
                count: { $sum: 1 },
            },
        },
        { $sort: { "_id": 1 } },
    ]);

    return res.status(200).json({
        success: true,
        message: "Fetched successfully",
        data: {
            level,
            examsGrouped: grouped.map((g) => ({
                group: g._id,
                count: g.count,
                exams: g.exams,
            })),
        },
    });

}

export const deleteLevelById = async (req, res, next) => {
    const { levelId } = req.params;

    const level = await levelModel.findById(levelId);
    if (!level || level.isDeleted)
        return next(new ResError("Level not found or already deleted", 404));

    level.isDeleted = true;
    level.deletedAt = new Date();
    await level.save();

    await examModel.updateMany(
        { level: levelId },
        { isDeleted: true, deletedAt: new Date() }
    );

    return res.status(200).json({
        success: true,
        message: "Level deleted successfully",
    });
};

export const updateLevel = async (req, res, next) => {
    const { levelId } = req.params;
    const { title, description } = req.body;
    if (!Object.keys(req.body).length) return next(new ResError("no thing send to update", 400))
    const level = await levelModel.findByIdAndUpdate(levelId,req.body, {
        new: true,
        runValidators: true
    });
    if (!level)
        return next(new ResError("Level not found or already deleted", 404));
    return res.status(200).json({
        success: true,
        message: "Level updated successfully",
        data: { id: level._id, title: level.title, description: level.description }
    });
};