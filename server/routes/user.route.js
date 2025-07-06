import  { Router } from "express";
import { becomeSellerController, forgotPasswordController, loginUserController, logoutUserController, refreshTokenController, registerUserController, resetPasswordController, updateUserDetails, uploadAvatar, userDetails, verifyEmailController, verifyForgotPasswordController } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js"; // Assuming you have a multer configuration file




const UserRouter = Router();

UserRouter.post("/register", registerUserController);
UserRouter.post("/verify-email", verifyEmailController);
UserRouter.post("/login", loginUserController);
UserRouter.get('/logout',auth,logoutUserController);
UserRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar);
UserRouter.put('/update-user',auth,updateUserDetails); // Assuming you have a multer configuration file
UserRouter.put('/forgot-password',forgotPasswordController);
UserRouter.put('/verify-forgot-password-otp',verifyForgotPasswordController);
UserRouter.put('/reset-password',resetPasswordController);
UserRouter.post('/refresh-token',refreshTokenController);
UserRouter.get('/user-details',auth,userDetails);
UserRouter.post('/become-seller', auth, becomeSellerController);

export default UserRouter;


