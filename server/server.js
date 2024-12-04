import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";


dotenv.config();

const app = express();

connectDB();

// middleware
app.use(express.json());
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Root"); 
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT, () => {
    console.log(`Server started at ${PORT}`);
});