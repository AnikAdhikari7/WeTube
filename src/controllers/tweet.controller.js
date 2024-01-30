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

// get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    try {
        const tweets = await Tweet.find({ owner: userId })
            .select("-__v -owner")
            .lean()
            .sort("-createdAt")
            .limit(10)
            .exec();

        if (!tweets) {
            throw new ApiError(500, "Unable to get tweets");
        }

        // add owner field to each tweet
        const tweetsOwner = {
            username: req.user?.username,
            _id: req.user?._id,
        };

        res.status(200).json(
            new ApiResponse(
                200,
                { tweetsOwner, tweets },
                "Tweets retrieved successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to get tweets");
    }
});

// update tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { newTweetContent } = req.body;
    console.log(tweetId, newTweetContent);

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required");
    }

    if (!newTweetContent) {
        throw new ApiError(400, "New tweet content is required");
    }

    try {
        const existingTweet = await Tweet.findById(tweetId);

        if (!existingTweet) {
            throw new ApiError(404, "Tweet not found");
        }

        // check if the tweet belongs to the user
        if (existingTweet.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(403, "Unauthorized");
        }

        // update tweet
        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set: {
                    content: newTweetContent,
                },
            },
            { new: true }
        );

        if (!updatedTweet) {
            throw new ApiError(500, "Unable to update tweet");
        }

        res.status(200).json(
            new ApiResponse(200, updatedTweet, "Tweet updated successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Unable to update tweet");
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
});

export { createTweet, deleteTweet, getUserTweets, updateTweet };
