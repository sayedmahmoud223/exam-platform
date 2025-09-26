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

    refreshToken: { type: String},

    // Student-specific
    teacher: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // linked teacher
    openedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }]
}, { timestamps: true });

export const userModel = mongoose.model("User", userSchema);
