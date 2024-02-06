// import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    } else if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const userId = req.user?._id;
    const credentials = { subscriber: userId, channel: channelId };

    try {
        const subscription = await Subscription.findOne(credentials);

        if (subscription) {
            // if already subscribed, then unsubscribe
            const deleted = await Subscription.deleteOne(credentials).exec();

            if (!deleted) {
                throw new ApiError(500, "Failed to unsubscribe");
            }

            res.status(200).json(
                new ApiResponse(200, deleted, "Unsubscribed successfully")
            );
        } else {
            // if not subscribed, then subscribe
            const newSubscription = await Subscription.create(credentials);

            // another way to subscribe
            // const newSubscription = new Subscription(credentials);
            // const saved = await newSubscription.save();

            if (!newSubscription) {
                throw new ApiError(500, "Failed to subscribe");
            }

            res.status(201).json(
                new ApiResponse(201, newSubscription, "Subscribed successfully")
            );
        }
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Failed to toggle subscription"
        );
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
});

export { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription };
