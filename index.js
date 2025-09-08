import "./src/utilis/envConfig.js"
import express from "express";
import { initApp } from "./src/initApp.js";
import { connectDB } from "./DB/DbConnection.js";

connectDB()
const app = express();


initApp(app, express);

app.listen(process.env.PORT, () => {
    console.log("server connected");

})

export default app;
