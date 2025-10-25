import mongoose from "mongoose"



const levelSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
}, { timestamps: true });

levelSchema.virtual("exams", {
    ref: "Exam",
    localField: "_id",
    foreignField: "level"
})

levelSchema.virtual("students", {
    ref: "User",
    localField: "_id",
    foreignField: "levels",
});

levelSchema.set("toJSON", { virtuals: true });
levelSchema.set("toObject", { virtuals: true })

levelSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

export const levelModel = mongoose.model("Level", levelSchema);
