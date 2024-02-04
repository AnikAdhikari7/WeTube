import mongoose, { isValidObjectId } from "mongoose";
import Video from "../models/video.model.js";
// import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Check if the user is the owner of the video
const isUserOwner = async (userId, videoId) => {
    if (!(isValidObjectId(userId) || isValidObjectId(videoId))) {
        return false;
    }

    const video = await Video.findById(videoId).exec();

    return video?.owner?.toString() === userId;
};

const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    /* 
    const videos = await Video.find({ isPublished: true })
        .populate("owner", "fullName email")
        .sort({ createdAt: "desc" })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
    
    const count = await Video.countDocuments({ isPublished: true });

    res.status(200).json(
        new ApiResponse(200, { videos, count }, "Videos fetched successfully")
    );
    */

    // parse page and limit to numbers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // set default values if query params are not provided
    page = Math.max(1, page); // page should be greater than 0
    limit = Math.min(20, Math.max(1, limit)); // limit should be between 1 and 20

    const pipeline = [];

    // match videos by owner userId if provided
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: mongoose.Types.ObjectId(userId),
            },
        });
    }

    // match videos by query if provided
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
            },
        });
    }

    // sort videos by sortBy and sortType if provided
    const sortCriteria = {};
    if (sortBy && sortType) {
        sortCriteria[sortBy] = sortType === "asc" ? 1 : -1;
        pipeline.push({
            $sort: sortCriteria,
        });
    } else {
        // default sort by createdAt in descending order
        sortCriteria["createdAt"] = -1;
        pipeline.push({
            $sort: sortCriteria,
        });
    }

    // add pagination using skip and limit
    pipeline.push({
        $skip: (page - 1) * limit,
    });
    pipeline.push({
        $limit: limit,
    });

    try {
        // execute the aggregation pipeline
        const videos = await Video.aggregate(pipeline).exec();

        if (!videos) {
            throw new ApiError(500, "Error in fetching videos");
        }

        res.status(200).json(
            new ApiResponse(200, videos, "Videos fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Error in fetching videos");
    }
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
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
};
