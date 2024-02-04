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

// welcome route
app.get(API_V, (req, res) => {
    if (req.accepts("html")) {
        res.send("<p>Welcome to WeTube!!</p>");
    } else if (req.accepts("json")) {
        res.json({ message: "Welcome to WeTube!!" });
    } else {
        res.type("txt").send("Welcome to WeTube!!");
    }
});

// routes import
import commentRouter from "./routes/comment.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";

// routes declaration
app.use(API_V + "/users", userRouter);
app.use(API_V + "/tweets", tweetRouter);
app.use(API_V + "/comments", commentRouter);
app.use(API_V + "/videos", videoRouter);

export default app;
