import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js"
import bcrypt from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import generateOtp from "../utils/generateOtp.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from "jsonwebtoken";
import e from "express";

export async function registerUserController(req, res) {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return response.status(400).json({
                message : "provide email, name, password",
                error : true,
                success : false
            })
        }

        const userExists = await UserModel.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "User already exists",
            });
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const payLoad = {
            name,
            email,
            password: hashedPassword,
        };

        const newUser=new UserModel(payLoad);
        const save=await newUser.save();
        const verifyEmailUrl=`${process.env.FRONTEND_URL}/verify-email?code=${save._id}`;

        const verifyEmail=await sendEmail({
            sendTo:email,
            subject:"Verify your email",
            html:verifyEmailTemplate({
                name,
                url:verifyEmailUrl
            })
        })

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: save,
            error: false,
        });



    } catch (error) {
        res.status(500).json({
            success: false,
            error: true,
            message: error.message || error,
            
        });
    }
}

export async function verifyEmailController(req, res) { 
    try {
        const { code } = req.body;
        const user = await UserModel.findOne({ _id: code }); // Ensure you're querying by `_id`
        if (!user) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "User not found",
            });
        }

        const updatedUser = await UserModel.updateOne(
            { _id: code },
            { verify_email: true }
        );

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            error: false,
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
            error: true
        });
    }
}

export async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Please provide email and password",
            });
        }
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: true,
                message: "User not found",
            });
        }

        if(user.status!=="active"){
            return res.status(403).json({
                success: false,
                error: true,
                message: "User is not active",
            });
        }

        const checkPassword=await bcrypt.compare(password,user.password);

        if(!checkPassword){
            return res.status(400).json({
                success: false,
                error: true,
                message: "Invalid password",
            });
        }

        const accesstoken=await generatedAccessToken(user._id);
        const refreshtoken=await generatedRefreshToken(user._id);

        const updateUser=await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date: new Date(),
        })

        

        const cookieOption={
            httpOnly:true,
            secure:true,
            sameSite:"None",}

        res.cookie("accesstoken",accesstoken,cookieOption);
        res.cookie("refreshtoken",refreshtoken,cookieOption);

        return res.status(200).json({
            success: true,
            error: false,
            message: "User logged in successfully",
            data: {
            accesstoken,
            refreshtoken}
        });



    } catch (error) {
        console.error(error); // Log the full error
        return res.status(500).json({
            success: false,
            message: error.message || error,
            error: true
        });
}
}

export async function logoutUserController(req,res){
    try {
        const userid = req.userId //middleware

        
        const cookieOption={
            httpOnly:true,
            secure:true,
            sameSite:"None",}

        res.clearCookie("accesstoken",cookieOption)
        res.clearCookie("refreshtoken",cookieOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        return res.json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}   

export async function uploadAvatar(req, res) {
    try {
        const userId = req.userId; // Assuming you have middleware to set this
        const image = req.file; // Assuming you're using multer to handle file uploads
        const upload =await uploadImageCloudinary(image); // Upload the image to Cloudinary
        
        const updateUser=await UserModel.findByIdAndUpdate(userId,{
            avatar: upload.url, // Assuming the response from Cloudinary contains the URL
        })

        return res.status(200).json({
            success: true,
            error: false,
            message: "Avatar uploaded successfully",
            data: {
                avatar: upload.url, // The URL of the uploaded image
                _id: userId
            }, // The response from Cloudinary
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
            error: error.message,
        });
    }
}

export async function updateUserDetails(req, res) {
    try {
        const userId = req.userId; // Assuming you have middleware to set this
        const { name, email , mobile , password } = req.body; // Assuming you're sending name and email in the request body

        let hashPassword = "";
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashPassword = await bcrypt.hash(password, salt);
        }

        const updatedUser = await UserModel.updateOne({_id : userId}, {
            ...(name && { name :name }),// Only update if name is provided
            ...(email && {email :email}), 
            ...(mobile && {mobile :mobile}), 
            ...(password && {password :hashPassword}), // Only update if password is provided

        
        });

        return res.status(200).json({
            success: true,
            message: " updated successfully",
            error: false,
            data: updatedUser, // The updated user data
        });

        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
            error: true
        });
    }
}

export async function forgotPasswordController(req, res) {
    try {
        const {email} = req.body;
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
                error: true
            });
        }

    const otp=generateOtp();
    const expireTime =new Date()+ 30*60*1000; // 30 minutes from now  

    const update=await UserModel.findByIdAndUpdate(user._id,{
        forgot_password_otp: otp,
        forgot_password_expiry:new Date(expireTime).toISOString()
    })

    await sendEmail({
        sendTo: email,
        subject: "Reset ABC Account Password",
        html: forgotPasswordTemplate({
            name: user.name,
            otp: otp,
        }),
    });

    return res.status(200).json({
        success: true,
        error: false,
        message:"Check Your Email"
    })


    }catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
            error: true
        }); 
    }
       
}     

export async function verifyForgotPasswordController(req, res) {
    try {

        const {email, otp} = req.body;

        if(!email || !otp){
            return res.status(400).json({
                success: false,
                error: true,
                message: "Please provide email and otp",
            });
        }
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
                error: true
            });
        }

        const currentTime = new Date().toISOString(); // Get the current time in ISO format
        
        if(user.forgot_password_expiry< currentTime){
            return res.status(400).json({
                success: false,
                message: "OTP expired",
                error: true
            });
        }

        if(user.forgot_password_otp !== otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                error: true
            });
        }

        const update=await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp: "",
            forgot_password_expiry: "",
        });



        // OTP is valid, proceed with password reset
        return res.status(200).json({
            success: true,
            error: false,
            message: "OTP verified successfully",
            
        });



    }catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
            error: true
        }); 
    }
}
        
export async function resetPasswordController(req, res) {
    try{
        const{email,newPassword,confirmPassword}=req.body;

        if(!email || !newPassword || !confirmPassword){
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(404).json({
                success: false,
                error: true,
                message: "User not found",
            });
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match",
                error: true
            });
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const update=await UserModel.findByIdAndUpdate(user._id,{
            password: hashedPassword,
        });

        return res.status(200).json({
            success: true,
            error: false,
            message: "Password reset successfully",
        });



    }catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
            error: true
    })
}}

export async function refreshTokenController(req, res) {
    try {
        const refreshToken = req.cookies.refreshtoken || (req.headers?.authorization && req.headers.authorization.split(" ")[1]); // Get the refresh token from cookies

        if(!refreshToken) {
            return res.status(401).json({
                success: false,
                error: true,
                message: "Refresh token not found",
            });
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
        if(!verifyToken){
            return res.status(401).json({
                success: false,
                error: true,
                message: "Invalid refresh token",
            });
        }
        
        // Make sure we're using the correct property from the token
        const userId = verifyToken.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: true,
                message: "Invalid user ID in refresh token",
            });
        }
        
        const newAccessToken = await generatedAccessToken(userId);

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        res.cookie("accesstoken", newAccessToken, cookieOption);

        return res.status(200).json({
            success: true,
            message: "New access token generated successfully",
            error: false,
            data: {
                accesstoken: newAccessToken,
            },
        });


  
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            error: error.message,
        });
    }
}

//get login user details
export async function userDetails(req, res) {
    console.log("auth middleware running");
    try {
        const userId = req.userId; // Assuming you have middleware to set this
        console.log("user id",userId);
        const user = await UserModel.findById(userId).select("-password -refresh_token"); // Exclude sensitive fields

        

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: user,
            error: false,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something is Wrong',
            error: true
        });
    }
}

export async function becomeSellerController(req, res) {
    try {
        const userId = req.userId;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                error: true
            });
        }
        if (user.role === "seller") {
            return res.status(400).json({
                success: false,
                message: "You are already a seller!",
                error: true
            });
        }
        await UserModel.updateOne({ _id: userId }, { role: "seller" });
        res.json({ success: true, message: "You are now a seller!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, error: true });
    }
}