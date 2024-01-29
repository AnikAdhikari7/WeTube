import Tweet from "../models/tweet.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// create tweet
const createTweet = asyncHandler(async (req, res) => {
    const { tweetContent } = req.body;

    if (!tweetContent) {
        throw new ApiError(400, "Tweet content is required");
    }

    try {
        const tweet = await Tweet.create({
            owner: req.user?._id,
            content: tweetContent,
        });

        if (!tweet) {
            throw new ApiError(500, "Tweet not created");
        }

        res.status(201).json(
            new ApiResponse(201, tweet, "Tweet created successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to create tweet");
    }
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
});

export { createTweet, deleteTweet, getUserTweets, updateTweet };
