import  { Router } from "express";
import { becomeSellerController, forgotPasswordController, loginUserController, logoutUserController, refreshTokenController, registerUserController, resetPasswordController, updateUserDetails, uploadAvatar, userDetails, verifyEmailController, verifyForgotPasswordController } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import sendEmail from "../config/sendGridEmail.js";

const UserRouter = Router();

// Test email endpoint for debugging SendGrid
UserRouter.post('/test-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email address",
                error: true
            });
        }

        console.log(`🧪 Testing email sending to: ${email}`);

        const testResult = await sendEmail({
            sendTo: email,
            subject: "🧪 SendGrid Test Email - EcoMarket",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #4CAF50;">SendGrid Test Email</h2>
                    <p>Hello!</p>
                    <p>This is a test email to verify that SendGrid is working correctly with your EcoMarket application.</p>
                    <p>If you received this email, your SendGrid configuration is working properly!</p>
                    <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Test Time:</strong> ${new Date().toLocaleString()}
                    </div>
                    <p>Best regards,<br>EcoMarket Team</p>
                </div>
            `
        });

        if (testResult) {
            return res.status(200).json({
                success: true,
                message: "Test email sent successfully! Check your inbox.",
                error: false
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Failed to send test email. Check server logs for details.",
                error: true
            });
        }
    } catch (error) {
        console.error("Test email error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Test email failed",
            error: true
        });
    }
});

UserRouter.post("/register", registerUserController);
UserRouter.post("/verify-email", verifyEmailController);
UserRouter.post("/login", loginUserController);
UserRouter.get('/logout',auth,logoutUserController);
UserRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar);
UserRouter.put('/update-user',auth,updateUserDetails);
UserRouter.put('/forgot-password',forgotPasswordController);
UserRouter.put('/verify-forgot-password-otp',verifyForgotPasswordController);
UserRouter.put('/reset-password',resetPasswordController);
UserRouter.post('/refresh-token',refreshTokenController);
UserRouter.get('/user-details',auth,userDetails);
UserRouter.post('/become-seller', auth, becomeSellerController);

export default UserRouter;
