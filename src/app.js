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
    const repoLink = "https://github.com/AnikAdhikari7/WeTube";
    if (req.accepts("html")) {
        res.send(
            `<p>Welcome to WeTube!! Code and "How to use?" available at <a href="${repoLink}">[GitHub Repo]</a></p>`
        );
    } else if (req.accepts("json")) {
        res.json({
            message: "Welcome to WeTube!!",
            code: repoLink,
            "howToUse?": repoLink + "/blob/main/README.md",
        });
    } else {
        res.type("txt").send(
            `Welcome to WeTube!! Code and "How to use?" available at [GitHub Repo]: ${repoLink}`
        );
    }
});

// routes import
import commentRouter from "./routes/comment.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";

// routes declaration
app.use(API_V + "/users", userRouter);
app.use(API_V + "/tweets", tweetRouter);
app.use(API_V + "/comments", commentRouter);
app.use(API_V + "/videos", videoRouter);
app.use(API_V + "/subscriptions", subscriptionRouter);
app.use(API_V + "/playlist", playlistRouter);
app.use(API_V + "/likes", likeRouter);
app.use(API_V + "/healthcheck", healthcheckRouter);

export default app;
