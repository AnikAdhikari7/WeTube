import mongoose, { isValidObjectId } from "mongoose";
import Comment from "../models/comment.model.js";
import Video from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!(videoId || isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid video id");
    } else if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    try {
        const comment = await Comment.create({
            content,
            video: videoId,
            owner: req.user?._id,
        });

        if (!comment) {
            throw new ApiError(500, "Unable to add comment");
        }

        res.status(201).json(
            new ApiResponse(201, comment, "Comment added successfully")
        );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Something went wrong while adding comment"
        );
    }
});

// get comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!(videoId || isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid video id");
    }

    try {
        // check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            // delete all comments for this video if video is not found
            await Comment.deleteMany({ video: videoId });
            throw new ApiError(404, "Video not found");
        }

        // const comments = await Comment.find({ videoId })
        //     .limit(limit * 1)
        //     .skip((page - 1) * limit)
        //     .exec();

        // send comments with owner info
        const commentsAggregate = Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "comment",
                    as: "likes",
                },
            },
            {
                $addFields: {
                    likesCount: {
                        $size: "$likes",
                    },
                    owner: {
                        $first: "$owner",
                    },
                    isLiked: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false,
                    },
                },
            },
            {
                $addFields: {
                    content: 1,
                    createdAt: 1,
                    likesCount: 1,
                    owner: {
                        _id: 1,
                        fullName: 1,
                        username: 1,
                        "avatar.url": 1,
                    },
                    isLiked: 1,
                },
            },
        ]);

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
        };

        const comments = await Comment.aggregatePaginate(
            commentsAggregate,
            options
        );

        if (!comments) {
            throw new ApiError(500, "Unable to get comments");
        }

        res.status(200).json(
            new ApiResponse(200, comments, "Comments fetched successfully")
        );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Something went wrong while getting comments"
        );
    }
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { newContent } = req.body;

    if (!(commentId || isValidObjectId(commentId))) {
        throw new ApiError(400, "Invalid comment id");
    } else if (!newContent) {
        throw new ApiError(400, "New comment content is required");
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "comment not found");
        }
        // video is published or not
        const videoId = mongoose.Types.ObjectId(comment.video);
        const video = await Video.findById(videoId);
        if (!video) {
            //if video doesn't exists then comment should be deleted
            await Comment.deleteMany({ video: videoId }); //assume it is successfull
            throw new ApiError(300, "Video doesn't exists");
        }

        if (comment.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(300, "Unauthorized Access");
        }

        const newComment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content: newContent,
                },
            },
            { new: true }
        );

        if (!newComment) {
            throw new ApiError(500, "Unable to update comment");
        }

        res.status(201).json(
            new ApiResponse(201, newComment, "Comment updated successfully")
        );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Something went wrong while updating comment"
        );
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!(commentId || isValidObjectId(commentId))) {
        throw new ApiError(400, "Invalid comment id");
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "comment not found");
        }
        // video is published or not
        const videoId = mongoose.Types.ObjectId(comment.video);
        const video = await Video.findById(videoId);
        if (!video) {
            //if video doesn't exists then comment should be deleted
            await Comment.deleteMany({ video: videoId }); //assume it is successfull
            throw new ApiError(300, "Video doesn't exists");
        }

        if (comment.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(300, "Unauthorized Access");
        }

        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if (!deletedComment) {
            throw new ApiError(500, "Unable to delte comment");
        }

        res.status(201).json(
            new ApiResponse(201, deletedComment, "Comment deleted successfully")
        );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Something went wrong while deleting comment"
        );
    }
});

export { addComment, deleteComment, getVideoComments, updateComment };
