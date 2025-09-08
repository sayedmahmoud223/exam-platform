import mongoose from "mongoose";


export const connectDB = () => {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            console.log("✅ MongoDB Connected...");
        })
        .catch((err) => {
            console.error("❌ Error connecting MongoDB:", err.message);
            process.exit(1); // Exit process if failed
        });
};
