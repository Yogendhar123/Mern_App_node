import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { connectDB } from "./DBConnection/dbConnection.js";
import authRoutes from "../backend/routes/Routes.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: "http://localhost:1999", credentials: true }));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api", authRoutes);


app.listen(PORT, () => {
	connectDB();
	console.log("Server is running on port: ", PORT);
});