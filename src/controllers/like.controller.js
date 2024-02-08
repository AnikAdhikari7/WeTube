import mongoose, { isValidObjectId } from "mongoose";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Tweet from "../models/tweet.model.js";
import Video from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const userId = req.user?._id;

    try {
        const video = await Video.findById(videoId);

        if (
            !video ||
            (video.owner.toString() !== userId.toString() && !video.isPublished)
        ) {
            throw new ApiError(404, "Video not found");
        }

        const likeCriteria = { video: videoId, likedBy: userId };

        const alreadyLiked = await Like.findOne(likeCriteria);

        if (alreadyLiked) {
            // if already liked, then unlike
            const deleted = await Like.findByIdAndDelete(alreadyLiked._id);

            if (!deleted) {
                throw new ApiError(500, "Failed to unlike video");
            }

            return res
                .status(200)
                .json(
                    new ApiResponse(200, deleted, "Video unliked successfully")
                );
        } else {
            // if not liked, then like
            const newLike = await Like.create(likeCriteria);

            if (!newLike) {
                throw new ApiError(500, "Failed to like video");
            }

            return res
                .status(201)
                .json(
                    new ApiResponse(201, newLike, "Video liked successfully")
                );
        }
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Failed to toggle like on video"
        );
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const userId = req.user?._id;

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        const likeCriteria = { comment: commentId, likedBy: userId };

        const alreadyLiked = await Like.findOne(likeCriteria);

        if (alreadyLiked) {
            // if already liked, then unlike
            const deleted = await Like.findByIdAndDelete(alreadyLiked._id);

            if (!deleted) {
                throw new ApiError(500, "Failed to unlike comment");
            }

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        deleted,
                        "Comment unliked successfully"
                    )
                );
        } else {
            // if not liked, then like
            const newLike = await Like.create(likeCriteria);

            if (!newLike) {
                throw new ApiError(500, "Failed to like comment");
            }

            return res
                .status(201)
                .json(
                    new ApiResponse(201, newLike, "Comment liked successfully")
                );
        }
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Failed to toggle like on comment"
        );
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const userId = req.user?._id;

    try {
        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        const likeCriteria = { tweet: tweetId, likedBy: userId };

        const alreadyLiked = await Like.findOne(likeCriteria);

        if (alreadyLiked) {
            // if already liked, then unlike
            const deleted = await Like.findByIdAndDelete(alreadyLiked._id);

            if (!deleted) {
                throw new ApiError(500, "Failed to unlike tweet");
            }

            return res
                .status(200)
                .json(
                    new ApiResponse(200, deleted, "Tweet unliked successfully")
                );
        } else {
            // if not liked, then like
            const newLike = await Like.create(likeCriteria);

            if (!newLike) {
                throw new ApiError(500, "Failed to like tweet");
            }

            return res
                .status(201)
                .json(
                    new ApiResponse(201, newLike, "Tweet liked successfully")
                );
        }
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Failed to toggle like on tweet"
        );
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    try {
        const likedVideos = await Like.aggregate([
            {
                // match the liked videos by the user
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                // lookup the video details
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVideos",
                },
            },
            {
                $unwind: "$likedVideos",
            },
            {
                // match the liked videos which are published
                $match: {
                    "likedVideos.isPublished": true,
                },
            },
            {
                // lookup the owner details
                $lookup: {
                    from: "users",
                    let: { owner_id: "$likedVideos.owner" },
                    pipeline: [
                        // pipeline to match the owner details
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$owner_id"] },
                            },
                        },
                        {
                            // project the required fields
                            $project: {
                                _id: 0,
                                username: 1,
                                avatar: 1,
                                fullName: 1,
                            },
                        },
                    ],
                    as: "owner",
                },
            },
            {
                // unwind the owner details
                $unwind: { path: "$owner", preserveNullAndEmptyArrays: true },
            },
            {
                // project the required fields
                $project: {
                    _id: "$likedVideos._id",
                    title: "$likedVideos.title",
                    thumbnail: "$likedVideos.thumbnail",
                    duration: "$likedVideos.duration",
                    views: "$likedVideos.views",
                    owner: {
                        username: "$owner.username",
                        avatar: "$owner.avatar",
                        fullName: "$owner.fullName",
                    },
                },
            },
            {
                // group the liked videos
                $group: {
                    _id: null,
                    likedVideos: { $push: "$$ROOT" },
                },
            },
            {
                // project the required fields
                $project: {
                    _id: 0,
                    likedVideos: 1,
                },
            },
        ]);

        if (likedVideos.length === 0) {
            return res
                .status(404)
                .json(new ApiResponse(404, [], "No liked videos found"));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, likedVideos, "Liked videos fetched"));
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Failed to fetch liked videos"
        );
    }
});

export { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike };
