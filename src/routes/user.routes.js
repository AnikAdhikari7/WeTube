import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refereshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const userRouter = Router();

// register router
userRouter.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);
// login router
userRouter.route("/login").post(loginUser);
// secured routers
userRouter.route("/logout").post(verifyJWT, logoutUser);

// refresh token router
userRouter.route("/refresh-token").post(refereshAccessToken);
// change password router
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);
// update account details
userRouter.route("/update-account").patch(verifyJWT, updateAccountDetails);

// get current user
userRouter.route("/current-user").get(verifyJWT, getCurrentUser);

// update user avatar
userRouter
    .route("/avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// update user cover image
userRouter
    .route("/cover-image")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// get user channel profile
userRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile);

// get user watch history
userRouter.route("/watch-history").get(verifyJWT, getWatchHistory);

export default userRouter;
