import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiErrors } from '../utils/ApiErrors.js'
import { User } from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js';
import { ApiResponce } from '../utils/ApiResponse.js';


// Get data from frontEnd 
// validate data 
// check is user already exist 
// check image and upload them to coudinery 
// creat user in database 
// don't send password and refresh token to response 
// check usercreated and send retrun response and error

const userRegister = asyncHandler(async (req, res) => {

    const { fullName, username, email, password } = req.body

    if (
        [fullName, username, email, password].some((field) => field?.trim() === '')
    ) {
        throw new ApiErrors(400, 'fill all the fields ');
    }
    // console.log(fullName, username, email, password);


    const userExisting = await User.findOne({
        $or: [{ username }, { email }]
    });

    // if (userExisting) {
    //     throw new ApiErrors(409, 'User already exists');
    // }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path ?? '';

   
    if (!avatarLocalPath) {
        throw new ApiErrors(400, " avatar file is requred with avatarLocalPath ");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatar.url + " File path")


    return;

    if (!avatar) {
        throw new ApiErrors(400, "avatar file is required");
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username,
    })

    const isUserCreated = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    if (!isUserCreated) {
        throw new ApiErrors(500, "Something went wrong while registring the user");
    }

    return res.status(201).json(
        new ApiResponce(200, " User is registreted successfuly ", isUserCreated)
    )

})



export default userRegister;