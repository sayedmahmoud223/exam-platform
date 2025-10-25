import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    level: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },  
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    questions: [
        {
            questionText: String,
            options: [String],   // ["A", "B", "C", "D"]
            correctAnswer: String, // For auto-grading
        }
    ],
    group: {
        type: String,
        enum: ["A", "B", "C", "D", "E"],
        required: true,
    },
    startTime: Date,
    durationMinutes: Number,
    passingScore: { type: Number },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
}, { timestamps: true });

examSchema.index({ level: 1, group: 1 });
examSchema.pre(/^find/, function (next) {
    // this => current query
    this.where({ isDeleted: false });
    next();
});

export const examModel = mongoose.model("Exam", examSchema);
