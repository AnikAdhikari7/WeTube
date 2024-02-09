import mongoose from "mongoose";
import Video from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user?._id;

    try {
        const channelStats = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "owner",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes",
                },
            },
            {
                $group: {
                    _id: null,
                    totalVideos: { $sum: 1 },
                    totalViews: { $sum: "$views" },
                    totalSubscribers: { $sum: { $size: "$subscribers" } },
                    totalLikes: { $sum: { $size: "$likes" } },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalVideos: 1,
                    totalViews: 1,
                    totalSubscribers: 1,
                    totalLikes: 1,
                },
            },
        ]);

        if (!channelStats.length) {
            throw new ApiError(404, "No channel found");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    channelStats[0],
                    "Channel stats fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Unable to get channel stats"
        );
    }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    try {
        const videos = await Video.find({ owner: userId }).sort({
            createdAt: -1,
        });

        if (!videos || !videos.length) {
            throw new ApiError(404, "No videos found");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    videos,
                    "Channel videos fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Unable to get channel videos"
        );
    }
});

export { getChannelStats, getChannelVideos };
