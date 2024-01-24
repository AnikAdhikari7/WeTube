import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// options for cookie
const options = {
    httpOnly: true,
    secure: true,
};

// generate access and refresh tokens
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access & refresh token"
        );
    }
};

// register user
const registerUser = asyncHandler(async (req, res) => {
    /* what to do
    
    get user details from frontend
    validation - not empty
    check if user already exists: username, email
    check for images, check for avatar
    upload them to cloudinary, avatar
    create user object - create entry in db
    remove password and refresh token field from response
    check for user creation
    return res
    */

    // get user details from frontend
    const { username, email, password, fullName } = req.body;
    // console.log("email: ", email);

    // validation - not empty
    if (
        [username, email, password, fullName].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });

    // thorow error if user already exists
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }
    // console.log("req.files: ", req.files);

    // local path, avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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

// login user
const loginUser = asyncHandler(async (req, res) => {
    /* what to do

    req body -> data
    username or email
    find the user
    password check
    access and referesh token
    send cookie
    */

    const { username, email, password } = req.body;
    // console.log(req.body);

    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required");
    }

    // find the user
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // access and referesh token
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    );

    // get user details without password and refresh token
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // console.log("accessToken: ", accessToken);
    // console.log("refreshToken: ", refreshToken);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
    // remove refresh token from db
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

// refresh access token
const refereshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from cookie or body
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        // verify refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // check if refresh token is valid
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        // generate new access and refresh tokens
        const { accessToken, refreshToken } =
            await generateAccessAndRefereshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // check if old password and new password are same
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    // update the password and save the user
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    req.user,
                    "Current user fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while fetching the current user"
        );
    }
});

// update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    let user;

    // check if both fullName and email are present and update accordingly
    if (fullName && email) {
        user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName,
                    email,
                },
            },
            { new: true }
        ).select("-password");
    } else if (fullName) {
        user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName,
                },
            },
            { new: true }
        ).select("-password");
    } else if (email) {
        user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    email,
                },
            },
            { new: true }
        ).select("-password");
    } else {
        throw new ApiError(400, "Atleast one field is required to update");
    }

    return res
        .status(200)
        .json(200, user, "Account details updated successfully");
});

// update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    // get avatar local path
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // upload avatar to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(500, "Error while uploading the avatar");
    }

    // update the avatar field in db
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

// update user cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    // get cover image local path
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    // upload cover image to cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(500, "Error while uploading the cover image");
    }

    // update the cover image field in db
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User cover image updated successfully")
        );
});

export {
    changeCurrentPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refereshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
};
