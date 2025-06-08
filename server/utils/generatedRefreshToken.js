import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generatedRefreshToken = async (userId) => {
    // Get the user to include role information
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    
    const token = await jwt.sign(
        {
            id: userId,
            role: user.role,
            email: user.email
        },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: "30d" }
    );

    const updatedRefreshTokenUser = await UserModel.updateOne(
        { _id: userId },
        { refresh_token: token }
    );

    return token;
}

export default generatedRefreshToken;