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

    const { fullname, username, eamil, password } = req.body

    if (
        [fullname, username, eamil, password].some((field) => field?.trime() === '')
    ) {
        throw new ApiErrors(400, 'fill all the fields ');
    }

    const userExisting = User.findOne({
        $or: [{ username }, { eamil }]
    });

    if (userExisting) {
        throw new ApiErrors(409, 'User  already exists');
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiErrors(400, "avatar file is requred");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiErrors(400, "avatar file is required");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        eamil,
        password,
        username: username.toLowerCase()
    })

    const isUserCreated = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    if (!isUserCreated) {
        throw new ApiErrors(500, "Something went wrong while registring the user");
    }

    await ApiResponce(200, 'User is registreted successfuly', isUserCreated, 200)

    return res.status(201).json(
        new ApiResponce(200, " User is registreted successfuly ", isUserCreated)
    )

})



export default userRegister;