import { userModel } from "../../../DB/models/user.model.js";
import { ResError } from "../../utilis/ErrorHandling.js";
import { methodsWillUsed } from "../../utilis/methodsWillUse.js";
import { sendEmail } from "../../utilis/sendEmail.js";


export const signup = async (req, res, next) => {
    const { name, email, password, role } = req.body
    const userIsExist = await userModel.findOne({ email })
    if (userIsExist) return next(new ResError("user already exists", 400));
    if (!["STUDENT", "TEACHER"].includes(role)) return next(new ResError("invalid role", 400));
    const user = await userModel.create(
        { name, email, password: methodsWillUsed.hash({ plaintext: password }), role }
    )
    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { id: user._id, email: user.email, role: user.role }
    });
}


export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user || !user.isActive) return next(new ResError("user not found", 404));

    const isMatch = methodsWillUsed.compare({ plaintext: password, hashValue: user.password });
    if (!isMatch) return next(new ResError("invalid credentials", 401));

    const accessToken = methodsWillUsed.generateToken({ payload: { id: user._id, email: user.email }, expiresIn: "15d" });
    const refreshToken = methodsWillUsed.generateToken({ payload: { id: user._id, email: user.email }, expiresIn: "15d" });

    // user.refreshToken = refreshToken;
    await user.save();
    // res.cookie('refreshToken', refreshToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'None',
    //     maxAge: 15 * 24 * 60 * 60 * 1000
    // });

    return res.status(200).json({
        success: true,
        message: "User login successfully",
        data: { id: user._id, email: user.email, role: user.role, accessToken }
    });
};



function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}



export async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) return next(new ResError("Email requierd"), 400)

    const user = await userModel.findOne({ email });
    if (!user) {
        return next(new ResError("If that email exists, an OTP has been sent."), 400)
    }

    const otp = generateOtp();
    const OTP_EXPIRATION_MINUTES = 10;
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiresAt = expiresAt;
    await user.save();

    await sendEmail({
        to: user.email,
        subject: "Your Password Reset OTP",
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`
    })

    return res.json({ message: "If that email exists, an OTP has been sent." });
}


export async function resetPassword(req, res, next) {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
        return next(new ResError("email, otp, password required"), 400)
    }

    const user = await userModel.findOne({ email });
    if (!user) return next(new ResError("Invalid OTP or user"), 400)

    if (
        user.resetPasswordOtp !== otp ||
        !user.resetPasswordOtpExpiresAt ||
        user.resetPasswordOtpExpiresAt < new Date()
    ) {
        return next(new ResError("Invalid or expired OTP"), 400)
    }

    // update password
    const hashedPassword = methodsWillUsed.hash({ plaintext: password });

    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiresAt = null;
    await user.save();

    return res.json({ message: "Password updated successfully" });

}

export async function updateProfile(req, res) {
    const { id } = req.user;

    if (Object.entries(req.body).length === 0) {
        return next(new ResError("Nothing sent to update", 400));
    }

    const user = await userModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) {
        return next(new ResError("User not found", 404));
    }

    return res.json({ message: "User updated successfully", user });
}




// export const refreshAccessToken = async (req, res, next) => {
//     const token = req.cookies.refreshToken;
//     console.log(token);

//     if (!token) return next(new ResError("refresh token missing", 400));

//     const decoded = methodsWillUsed.verifyToken({ token });
//     const user = await userModel.findById(decoded.id);

//     if (!user || user.refreshToken !== token) {
//         return next(new ResError("invalid refresh token", 401));
//     }

//     const newAccessToken = methodsWillUsed.generateToken({
//         payload: { id: user._id, email: user.email },
//         expiresIn: "1h"
//     });

//     return res.status(200).json({ accessToken: newAccessToken });
// };


// export const logout = async (req, res, next) => {
//     const token = req.cookies.refreshToken;
//     if (!token) return res.status(200).json({ success: true, message: "Logged out" });
//     const decoded = methodsWillUsed.verifyToken({ token });
//     const user = await userModel.findById(decoded.id);

//     if (user) {
//         user.refreshToken = null;
//         await user.save();
//     }

//     res.clearCookie('refreshToken');

//     return res.status(200).json({ success: true, message: "Logged out successfully" });
// };




