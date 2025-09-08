import { userModel } from "../../../DB/models/user.model.js";
import { ApiFeatures } from "../../utilis/apiFeatures.js";
import { ResError } from "../../utilis/ErrorHandling.js";


export const getAllStudents = async (req, res, next) => {
    const apiFeatures = new ApiFeatures(userModel.find().select("-password"), req.query, userModel)
        .paginate()
        .filter()
        .search()
        .sort()
        .select();
    const result = await apiFeatures.execute();
    return res.status(200).json(result);
}


export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return next(new ResError("user not found", 404));

    const isMatch = methodsWillUsed.compare({ plaintext: password, hashValue: user.password });
    if (!isMatch) return next(new ResError("invalid credentials", 401));

    const accessToken = methodsWillUsed.generateToken({ payload: { id: user._id, email: user.email }, expiresIn: "1h" });
    const refreshToken = methodsWillUsed.generateToken({ payload: { id: user._id, email: user.email }, expiresIn: "15d" });

    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 15 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        success: true,
        message: "User login successfully",
        data: { id: user._id, email: user.email, role: user.role, accessToken }
    });
};


export const refreshAccessToken = async (req, res, next) => {
    const token = req.cookies.refreshToken;
    console.log(token);

    if (!token) return next(new ResError("refresh token missing", 400));

    const decoded = methodsWillUsed.verifyToken({ token });
    const user = await userModel.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
        return next(new ResError("invalid refresh token", 401));
    }

    const newAccessToken = methodsWillUsed.generateToken({
        payload: { id: user._id, email: user.email },
        expiresIn: "1h"
    });

    return res.status(200).json({ accessToken: newAccessToken });
};


export const logout = async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(200).json({ success: true, message: "Logged out" });
    const decoded = methodsWillUsed.verifyToken({ token });
    const user = await userModel.findById(decoded.id);

    if (user) {
        user.refreshToken = null;
        await user.save();
    }

    res.clearCookie('refreshToken');

    return res.status(200).json({ success: true, message: "Logged out successfully" });
};


