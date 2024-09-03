import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiErrors } from '../utils/ApiErrors.js'
import { User } from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js';
import { ApiResponce } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {

    const user = await User.findByIdAndUpdate(userId);

    if (!user) {
        throw new ApiErrors(408, "token user not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };

}


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

    if (userExisting) {
        throw new ApiErrors(409, 'User already exists');
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path ?? '';


    if (!avatarLocalPath) {
        throw new ApiErrors(400, " avatar file is requred with avatarLocalPath ");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatar.url + " File path")

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
        new ApiResponce(200, isUserCreated, " User is registreted successfuly ")
    )

})

// Get login data from user
// check is user is existing 
// check password 
// Generate refresh token 
// retrun res   

const userLogin = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    // console.log(username, email, password);

    if (!username || !email || !password) {
        if ([username, email, password].some((field) => field?.trim() === '')) {
            throw new ApiErrors(400, " username, eamil and password is required");
        }
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user || user.length === 0) {
        throw new ApiErrors(404, "User not found");
    }

    const isMatchPassword = await user.isPasswordCorrect(password);

    if (!isMatchPassword) {
        throw new ApiErrors(401, " unauthorezed request password are not metching");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);
    // console.log(refreshToken, accessToken);


    if (!(email === user.email)) {
        throw new ApiErrors(500, " Email and password is wrong");
    }

    const logedInuser = await User.findById(user.id).select('-password -refreshToken');
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponce(200, { user: logedInuser, refreshToken, accessToken }, "User is logedIn"));

});

// <!------ Secure routes  ----->
const userLogout = asyncHandler(async (req, res) => {
    // console.log(req.user);

    await User.findByIdAndUpdate(req.user._id,
        {
            refreshToken: undefined
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie('accessToken', options)
        .cookie('refreshToken', options)
        .json(new ApiResponce(200, {}, " User logged out"));
})

// Get refreshToken from cookies 
// Check refreshToken is matchin or not
// Generete new refreshToken and accessToken 
// set new refresh token in cookies 
const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = await req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiErrors(401, " Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = User.findById(decodedToken._id);

        if (!user) {
            throw new ApiErrors(401, " Invelid refresh token ");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiErrors(401, "Refresh token is expired or used ")
        }

        const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponce(200, { accessToken, refreshToken }, " Access token refreshed  "))


    } catch (error) {
        throw new ApiErrors(401, error?.message || " Invalid refresh token")
    }
})

export { userRegister, userLogin, userLogout, refreshAccessToken };

