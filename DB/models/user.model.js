import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
        type: String,
        enum: ["ADMIN", "TEACHER", "STUDENT"],
        required: true
    },

    // Teacher-specific
    isActive: { type: Boolean, default: false }, // admin approves teacher

    refreshToken: { type: String },

    // Student-specific
    // teacher: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // linked teacher    
    // OTP
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpiresAt: { type: Date },

    // user levels
    level: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

userSchema.index({ role: 1, isActive: 1, isDeleted: 1, createdAt: -1 });
userSchema.index({ name: "text", email: "text" });

userSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true })


export const userModel = mongoose.model("User", userSchema);
