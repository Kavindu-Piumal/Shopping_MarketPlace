import UserModel from "../models/user.model.js";


export const Admin = async(req, res, next) => {
  try {
    const userId = req.userId; // Assuming userId is set by the auth middleware
    const user=await UserModel.findById(userId);
    if(user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error:true,
        message: "Access denied. Admins only.",
      });
    }
    next(); // Proceed to the next middleware or route handler
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Permission error",
      error: error.message,
    });
  }
}