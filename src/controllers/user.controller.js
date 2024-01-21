import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // get user details from frontend
    const { username, email, password, fullName } = req.body;
    console.log("Email: ", email);

    // validation - not empty
    if (
        [username, email, password, fullName].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists: username, email
    const existedUser = User.findOne({ $or: [{ username }, { email }] });

    // thorow error if user already exists
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // local path, avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // thorow error if avatar is not uploaded
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // upload images to cloudinary, avatar and coverImage
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // thorow error if avatar upload fails on cloudinary
    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    // create user object - create entry in db
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // check for user creation and throw error if fails
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    // send response
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered Successfully!")
        );
});

export { registerUser };
