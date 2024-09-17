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
        console.log("file is uploaded : " + response.url)
        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteCloudineryImage = async function (oldfilePath) {

    console.log(oldfilePath)
    if (!oldfilePath) return null;

    cloudinary.uploader.destroy(oldfilePath, { resource_type: "auto", type: 'authenticated' })
    // fs.unlinkSync(oldfilePath);

}


const deleteCloudinaryImage = async (fileToDelete) => {
    return new Promise((resolve) => {

        cloudinary.uploader.destroy(fileToDelete, (error, result) => {
            console.log('result :: ', result);
            resolve({
                url: result.secure_url,
                asset_id: result.asset_id,
                public_id: result.public_id,
            }, {
                resource_type: "auto",
            })
        })
    })
}



export { uploadOnCloudinary, deleteCloudinaryImage };