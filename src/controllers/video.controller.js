import mongoose, { isValidObjectId } from "mongoose";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished = true } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Please provide title and description");
    }

    try {
        const videoLocalPath = req.files?.videoFile[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

        if (!videoLocalPath) {
            throw new ApiError(400, "Please provide video file");
        } else if (!thumbnailLocalPath) {
            throw new ApiError(400, "Please provide thumbnail");
        }

        const video = await uploadOnCloudinary(
            videoLocalPath,
            "videos/videoFile"
        );
        const thumbnail = await uploadOnCloudinary(
            thumbnailLocalPath,
            "videos/thumbnail"
        );

        if (!video?.url || !thumbnail?.url) {
            throw new ApiError(500, "Error in uploading video or thumbnail");
        }

        const newVideo = await Video.create({
            title,
            description,
            videoFile: video.url,
            thumbnail: thumbnail.url,
            duration: video.duration,
            owner: req.user?._id,
            isPublished,
        });

        if (!newVideo) {
            throw new ApiError(500, "Error in publishing video");
        }

        res.status(201).json(
            new ApiResponse(201, newVideo, "Video published successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Error in publishing video");
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
