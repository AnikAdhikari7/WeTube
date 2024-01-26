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

        let folder = "wetube/users/";
        if (type === "avatar") {
            folder += "avatars/";
        } else if (type === "coverImage") {
            folder += "cover-images/";
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

const deleteFromCloudinary = async (folderPath, avatarUrl) => {
    try {
        // return null if there is no public id
        if (!avatarUrl) return null;

        // extract the public id of the file to be deleted
        const publicId = avatarUrl.split("/").pop().split(".")[0];

        // delete the file from cloudinary
        const response = await cloudinary.uploader.destroy(
            folderPath + publicId
        );
        // file has been deleted successfully
        // console.log("file is deleted from cloudinary ", response);
        return response;
    } catch (error) {
        return null;
    }
};

export { deleteFromCloudinary, uploadOnCloudinary };
