import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiErrors } from '../utils/ApiErrors.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary, deleteCloudinaryImage } from '../utils/cloudinary.js';
import { ApiResponce } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateAccessAndRefreshToken = async (userId) => {

    const user = await User.findByIdAndUpdate(userId);

    if (!user) {
        throw new ApiErrors(400, " User Token not found ");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }

}

const options = {
    httpOnly: true,
    secure: true
}


// Get data from frontEnd 
// validate data 
// check is user already exist 
// check image and upload them to coudinery 
// creat user in database 
// don't send password and refresh token to response 
// check usercreated and send retrun response and error


const userRegister = asyncHandler(async (req, res) => {
    const { username, fullName, email, password } = req.body;

    if ([username, fullName, email, password].some(field => field?.trim() === '')) {
        throw new ApiErrors(400, " Fill all fields ");
    }

    const isUserExist = await User.findOne(
        {
            $or: [{ email }, { username }]
        }
    )

    if (isUserExist) {
        throw new ApiErrors(409, " User already exist ");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || '';

    if (!avatarLocalPath) {
        throw new ApiErrors(400, " avatar file is reqired ");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiErrors(400, " avatar file is required while uploading cloudinery ");
    }

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
    })

    const isUserCreated = await User.findById(user._id).select("-password -refreshToken");

    if (!isUserCreated) {
        throw new ApiErrors(500, "Something went wrong while registring the user");
    }

    return res.status(200).json(new ApiResponce(200, isUserCreated, " User is created successfuly "));

})

// Get login data from user
// check is user is existing 
// check password 
// Generate refresh token 
// retrun res   

const userLogin = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if ([username, email, password].some(field => field?.trim() === '')) {
        throw new ApiErrors(400, "username , email and password is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiErrors(401, " User is not exist ");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

    const isMatchPassword = await user.isPasswordCorrect(password);

    if (!isMatchPassword) {
        throw new ApiErrors(401, " Password is incorrect ");
    }

    if (user.email !== email) {
        throw new ApiErrors(401, " user email is wrong ");
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const isUserLoggedIn = await User.findById(user._id).select(" -password -refreshToken ");

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(new ApiResponce(200, { user: isUserLoggedIn, refreshToken, accessToken }, " User logged in successfuly "));

});

// <!------ Secure routes  ----->
const userLogout = asyncHandler(async (req, res) => {
    console.log(req.user);

    const user = await User.findByIdAndUpdate(req?.user._id);

    if (!user) {
        throw new ApiErrors(400, " User not found ");
    }

    user.accessToken = '';

    user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .cookie("accessToken", options)
        .cookie("refreshToken", options)
        .json(new ApiResponce(200, { user }, " User logged out successfuly "))


})

// Get refreshToken from cookies 
// Check refreshToken is matchin or not
// Generete new refreshToken and accessToken 
// set new refresh token in cookies 

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req?.cookies?.refreshToken || req?.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiErrors(400, " Unauthorized request  ");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findByIdAndUpdate(decodedToken._id);

        if (!user) {
            throw new ApiErrors(401, " Invailid refrsh  token ");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiErrors(401, " Refresh token is expaired or used ");
        }

        const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json(new ApiResponce(200, { refreshToken, accessToken }, "New access and refresh token is generated successfulyb"));

    } catch (error) {
        throw new ApiErrors(400, error?.message || " Invalid refresh token"
        )
    }

})

// Chenge password
const changeCurrentPassword1 = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, conPassword } = req.body;

    if (newPassword !== conPassword) {
        throw new ApiErrors(400, "Conform password is not matching ");
    }

    if ([oldPassword, newPassword].some(field => field?.trim === '')) {
        throw new ApiErrors(401, " OldPassword and NewPassword is required ");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiErrors(400, " User not found ");
    }

    const isMatchPassword = user.isPasswordCorrect(user.password);

    if (!isMatchPassword) {
        throw new ApiErrors(400, " Invalid OldPassword ");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponce(200, {}, "Password is chenged "));

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, conPassword } = req.body;

    if ([oldPassword, newPassword, conPassword].some(field => field?.trim() === '')) {
        throw new ApiErrors(401, " fill all the fields ");
    }

    if (newPassword !== conPassword) {
        throw new ApiErrors(401, " newPassword and Conform password is not matching  ");
    }

    const user = await User.findByIdAndUpdate(req.user._id);

    if (!user) {
        throw new ApiErrors(400, " User not found ");
    }

    const isMatchPassword = await user.isPasswordCorrect(oldPassword);

    if (!isMatchPassword) {
        throw new ApiErrors(400, " Invalid OldPassword ");
    }

    user.password = newPassword;
    user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponce(200, {}, "Password is changed successfuly "));

})

// Get corrent user
const getCorrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponce(200, req.user, "Corrent user fetched successfuly "));
})

// Update Acount 
const updateAccount1 = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body;

    if (!(email || fullName)) {
        throw new ApiErrors(400, 'Email and fullName is required');
    }


    const user = User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {
            new: true
        }
    ).select("-password");

    if (!user) {
        throw new ApiErrors(401, 'User not faound ');
    }

    return res
        .status(200)
        .json(new ApiResponce(200, { user }, " User updated successfuly "));

})

const updateAccount = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;


    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName: fullName?.trim() || this.fullName,
                email: email?.trim() || this.email
            }
        },
        {
            new: true
        }
    ).select("-password  -refreshToken");

    console.log(fullName, email);

    if (!user) {
        throw new ApiErrors(401, " user not found ");
    }

    return res.status(200).json(new ApiResponce(200, user, "user updated successfuly "));

})

// Update avatar image
const updateAvatarFile1 = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiErrors(400, "avatar file is missing ");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiErrors(401, "avatar is not found while cloudinery ");
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    // user.save({ validateBeforeSave: false });

    deleteCloudineryImage(avatarLocalPath);

    return res
        .status(200)
        .json(new ApiResponce(200, user, " avatar is updated"))


})

const updateAvatarFile = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiErrors(401, " Avatar file is reqired ");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log(avatar)

    if (!avatar.url) {
        throw new ApiErrors(401, " Somethin went wrong while uploading on coudinery ");
    }

    const user = await User.findById(req?.user._id);

    const upadteUser = await User.findByIdAndUpdate(req?.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    );

    await deleteCloudinaryImage(user.avatar);

    return res.status(200).json(new ApiResponce(200, { upadteUser }, " avatar file is uploaded successfuly "));
})

// Update coverImage
const updateCoverImage1 = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiErrors(400, " coverImage is missing ");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiErrors(400, " CoverImage is uploding on cloudinery ");
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password");

    await deleteCloudineryImage(coverImageLocalPath);

    return res
        .status(200)
        .json(new ApiResponce(200, user, "CoverImage is updated succesfuly "))

})

const updateCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiErrors(401, " coverImage is required ");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
        throw new ApiErrors(400, " CoverImage is uploding on cloudinery ");
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    )

    if (!user) {
        throw new ApiErrors(401, " user not find ");
    }

    // await deleteCloudineryImage(coverImageLocalPath)

    return res
        .status(200)
        .json(new ApiResponce(200, { user }, " CoverImage is updated successfuly "));

})

// Get user channel profile
const getUserChannelProfile1 = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiErrors(400, " User name is required ");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        }
        ,
        {
            $lookup: {
                from: 'subscriptions',
                localField: "_id",
                foreignField: "channel",
                as: 'subscribers'
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: "_id",
                foreignField: "subscriber",
                as: " channel"
            }
        },
        {
            $addFields: {
                subscriberCound: {
                    $size: "$subscribers"
                },
                channelSubscribedToCound: {
                    $size: "$channel"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, '$subscribers.subscriber'] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCound: 1,
                channelSubscribedToCound: 1,
                isSubscribed: 1,

            }
        }

    ])

    if (!channel?.length) {
        throw new ApiErrors(404, " Channel  does not exists ");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, channel[0], " User channel fetched successfuly"));


})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiErrors(400, " User name is required  ");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers'
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo'
            }
        },
        {
            $addFields: {
                subscriberCound: {
                    $size: '$subscribers'
                },
                channelSubscribedToCound: {
                    $size: '$subscribedTo'
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, '$subscribers.subscriber'] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1,
                subscriberCound: 1,
                channelSubscribedToCound: 1
            }
        }
    ])

    if (!channel) {
        throw new ApiErrors(404, " Channel does not exists ");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, channel[0], " Channel user fetched successfuly  "));

})

// Get user watch history
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: " watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$woner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponce(200, user[0].watchHistory, " user watch history fetched successfuly "));

})

export {
    userRegister,
    userLogin,
    userLogout,
    refreshAccessToken,
    changeCurrentPassword,
    getCorrentUser,
    updateAccount,
    updateAvatarFile,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
};

