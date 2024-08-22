import { ApiErrors } from '../utils/ApiErrors.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponce } from '../utils/ApiResponse.js';


// const userRegister = (req, res) => {
//     res.status(200).json({
//         massage: "MERN BACKEND"
//     })
// }

const userRegister = asyncHandler(async (req, res) => {

    const { fullname, email, password, username } = req.body;

    res.status(200).json('OKay .')
    console.log('Email: ' + req.body.email)

    if ([fullname, email, password, username].some((fields) => fields?.trime() === "")) {
        throw new ApiErrors(400, " All fields are required ")
    }

    const existedUser = User.find({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiErrors(409, " User or email is already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiErrors(400, " avatar file is required ");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiErrors(500, " something went wrong while  registring the user");
    }

    return res.status(201).json(
        new ApiResponce(200, createdUser, " User created successfuly")
    )

})


export default userRegister;