import { Router } from "express";
import {
    loginUser,
    logoutUser,
    refereshAccessToken,
    registerUser,
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

export default userRouter;
