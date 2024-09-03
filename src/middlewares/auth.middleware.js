import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';


const veriryJWT = asyncHandler(async (req, _, next) => {

    // console.log(req.cookies.accessToken)
    try {

        const token = await req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ", '');
        // console.log(token);

        if (!token) {
            throw new ApiErrors(401, " Unauthorized request while cookies ");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = User.findById(decodedToken?._id).select('-password -refreshToken');

        req.user = user;
        next();

    } catch (error) {
        throw new ApiErrors(401, error.message || "Invaild access token");
    }

})

export default veriryJWT;