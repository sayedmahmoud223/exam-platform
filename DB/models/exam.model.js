import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    level: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },  
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [
        {
            questionText: String,
            options: [String],   // ["A", "B", "C", "D"]
            correctAnswer: String, // For auto-grading
        }
    ],
    startTime: Date,
    durationMinutes: Number,
    passingScore: { type: Number },
}, { timestamps: true });

export const examModel = mongoose.model("Exam", examSchema);
