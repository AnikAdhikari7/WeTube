import { isValidObjectId } from "mongoose";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
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
    //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
});

export { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike };
