// external imports
import cors from "cors";
import express from "express";

// internal imports
import cookieParser from "cookie-parser";
import { API_V, MAX_LIMIT } from "./constants.js";

const app = express();

// middlewares
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: MAX_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: MAX_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import tweetRouter from "./routes/tweet.routes.js";
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use(API_V + "/users", userRouter);
app.use(API_V + "/tweets", tweetRouter);

export default app;
