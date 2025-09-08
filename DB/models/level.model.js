import mongoose from "mongoose"

const levelSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const levelModel = mongoose.model("Level", levelSchema);
