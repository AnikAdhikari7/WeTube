import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// configuration of cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// fn to upload file on cloudinary
const uploadOnCloudinary = async (localFilePath, type) => {
    try {
        // return null if there is no local file path
        if (!localFilePath) return null;

        let folder = "wetube/";
        if (type === "users/avatar") {
            folder += "users/avatars/";
        } else if (type === "users/coverImage") {
            folder += "users/cover-images/";
        } else if (type === "videos/videoFile") {
            folder += "videos/video-files/";
        } else if (type === "videos/thumbnail") {
            folder += "videos/thumbnails/";
        }

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: folder,
            public_id: path.basename(
                localFilePath,
                path.extname(localFilePath)
            ),
            display_name: path.basename(
                localFilePath,
                path.extname(localFilePath)
            ),
        });

        // remove the locally saved temporary file
        fs.unlinkSync(localFilePath);

        // file has been uploaded successfully
        return response;
    } catch (error) {
        console.log("error in uploading file on cloudinary ", error);
        // remove the locally saved temporary file as the upload operation failed
        fs.unlinkSync(localFilePath);
        return null;
    }
};

const deleteFromCloudinary = async (folderPath, fileUrl) => {
    try {
        // return null if there is no public id
        if (!fileUrl) return null;

        // extract the public id of the file to be deleted
        const publicId = fileUrl.split("/").pop().split(".")[0];

        // extract the file type
        let fileType = publicId.split("-")[0];
        fileType = fileType === "videoFile" ? "video" : "image";

        // delete the file from cloudinary
        const response = await cloudinary.uploader.destroy(
            folderPath + publicId,
            { resource_type: fileType, invalidate: true }
        );
        // file has been deleted successfully
        // console.log("file is deleted from cloudinary ", response);
        return response;
    } catch (error) {
        // console.log("error in deleting file from cloudinary ", error);
        return null;
    }
};

export { deleteFromCloudinary, uploadOnCloudinary };
