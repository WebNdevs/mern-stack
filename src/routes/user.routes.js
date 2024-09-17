import { Router } from "express";
import {
    userRegister,
    userLogin,
    userLogout,
    refreshAccessToken,
    changeCurrentPassword,
    getCorrentUser,
    updateAvatarFile,
    updateCoverImage,
    updateAccount,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controllers.js";
import { upload } from '../middlewares/multer.middlewares.js';
import veriryJWT from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    userRegister);
router.route('/login').post(upload.none(), userLogin); //✅

// secure routes
router.route('/logout').post(veriryJWT, userLogout);  //✅
router.route('/refresh-token').post(refreshAccessToken); //✅

router.route('/change-password').post(veriryJWT, upload.none(), changeCurrentPassword); //✅
router.route('/current-user').get(veriryJWT, getCorrentUser); //✅
router.route('/update-account').patch(veriryJWT,upload.none(), updateAccount); //✅


router.route('/avatar').patch(veriryJWT, upload.single('avatar'), updateAvatarFile)
router.route('/cover-image').patch(veriryJWT, upload.single('coverImage'), updateCoverImage)

router.route('/channel/:username').get(veriryJWT, getUserChannelProfile);
router.route('/history').get(veriryJWT, getWatchHistory)

export default router;