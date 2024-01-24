import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// configuration of cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// fn to upload file on cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // return null if there is no local file path
        if (!localFilePath) return null;

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // remove the locally saved temporary file
        fs.unlinkSync(localFilePath);

        // file has been uploaded successfully
        // console.log("file is uploaded on cloudinary ", response.url);
        return response;
    } catch (error) {
        // remove the locally saved temporary file as the upload operation failed
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export default uploadOnCloudinary;
