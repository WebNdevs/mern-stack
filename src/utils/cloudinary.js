import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})


const uploadOnCloudinary = async function (localFilePath) {
    // console.log(localFilePath + " Path from cloudinery ");
    try {

        if (!localFilePath) return console.log('File not found : ' + null);

        // File upload on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })

        //File has been uploaded on Cloudinary
        console.log("file is uploaded : " + response)
        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}


export default uploadOnCloudinary;