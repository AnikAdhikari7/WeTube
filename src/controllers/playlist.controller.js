import mongoose, { isValidObjectId } from "mongoose";
import Playlist from "../models/playlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description = `Playlist created by ${req.user?.fullName}` } =
        req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    try {
        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user?._id,
            videos: [],
        });

        if (!playlist) {
            throw new ApiError(500, "Failed to create playlist");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, playlist, "Playlist created successfully")
            );
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to create playlist");
    }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!(userId || isValidObjectId(userId))) {
        throw new ApiError(400, "Invalid user id");
    }

    try {
        const playlists = await Playlist.find({ owner: userId })
            .populate({
                path: "videos",
                select: "thumbnail",
                options: { sort: { _id: -1 }, limit: 1 },
            })
            .exec();

        if (!playlists || playlists.length === 0) {
            throw new ApiError(404, "No playlists found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, playlists, "User playlists"));
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Failed to get user playlists"
        );
    }
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!(playlistId || isValidObjectId(playlistId))) {
        throw new ApiError(400, "Invalid playlist id");
    }

    try {
        const playlist = await Playlist.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(playlistId),
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos",
                },
            },

            {
                $project: {
                    name: 1,
                    description: 1,
                    videos: {
                        $map: {
                            input: "$videos",
                            as: "video",
                            in: {
                                _id: "$$video._id",
                                title: "$$video.title",
                                thumbnail: "$$video.thumbnail",
                                duration: "$$video.duration",
                                views: "$$video.views",
                                owner: "$$video.owner",
                            },
                        },
                    },
                },
            },
        ]);

        if (
            !(
                playlist ||
                playlist.owner.toString() === req.user?._id.toString()
            )
        ) {
            throw new ApiError(404, "Playlist not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist details"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to get playlist");
    }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!(playlistId || isValidObjectId(playlistId))) {
        throw new ApiError(400, "Invalid playlist id");
    } else if (!(videoId || isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid video id");
    }

    try {
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        } else if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(
                403,
                "You are not authorized to add video to this playlist"
            );
        }

        // Check if video already exists in playlist
        const videoExists = playlist.videos.includes(videoId);

        if (videoExists) {
            throw new ApiError(400, "Video already exists in playlist");
        }

        // Add video to playlist
        playlist.videos.push(videoId);
        const updatedPlaylist = await playlist.save();

        if (!updatedPlaylist) {
            throw new ApiError(500, "Failed to add video to playlist");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedPlaylist, "Video added to playlist")
            );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Failed to add video to playlist"
        );
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    //TODO: update playlist
});

export {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
};
