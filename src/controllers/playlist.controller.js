// import mongoose, { isValidObjectId } from "mongoose";
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
    //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
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
