import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const generatedAccessToken = async (userId) => {
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
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: "5h" }
    );

    return token;
}

export default generatedAccessToken;