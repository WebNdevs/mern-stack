import { Router } from "express";
import { userRegister, userLogin, userLogout, refreshAccessToken } from "../controllers/user.controllers.js";
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
router.route('/login').post(upload.none(), userLogin)

// secure routes
router.route('/logout').post(veriryJWT, userLogout)
router.route('/refresh-token').post(refreshAccessToken)

export default router;