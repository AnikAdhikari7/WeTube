import { Router } from "express";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const tweetRouter = Router();
tweetRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

tweetRouter.route("/create").post(createTweet);
tweetRouter.route("/user").get(getUserTweets);
tweetRouter.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default tweetRouter;
