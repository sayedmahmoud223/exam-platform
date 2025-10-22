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
    const { levelId } = req.params
    const level = await levelModel.findById({ _id: levelId})
    if (!level) return next(new ResError("Level not found", 404));
    return res.status(200).json({
        success: true,
        message: "Fetched successfully",
        data: level
    });

}

