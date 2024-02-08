import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    try {
        return res
            .status(200)
            .json(new ApiResponse(200, { status: "UP" }, "Server is healthy!"));
    } catch (error) {
        throw new ApiError(500, "Server is unhealthy! Call the doctor!");
    }
});

export { healthcheck };
