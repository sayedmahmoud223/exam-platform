import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },

    answers: [
        {
            questionId: Number,
            answer: String
        }
    ],

    score: Number,
    graded: { type: Boolean, default: false }, 
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

examResultSchema.virtual("student_result", {
    ref: "User",
    localField: "student",
    foreignField: "_id",
})
examResultSchema.set("toJSON", { virtuals: true });
examResultSchema.set("toObject", { virtuals: true })    

module.exports = mongoose.model("ExamResult", examResultSchema);
