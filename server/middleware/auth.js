import jwt from "jsonwebtoken";

const auth=(req, res, next)=>{
    try{
        const token = req.cookies.accesstoken || req?.headers?.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        if(!decoded){
            return res.status(401).json({
                success: false,
                error:true,
                message: "Unauthorized access",
            });
        }
        req.userId = decoded.id;
        req.user = { role: decoded.role, id: decoded.id, email: decoded.email };


        next();




    }catch(error){
        // Return 401 for token verification errors instead of 500
        return res.status(401).json({
            success: false,
            message: "Authentication failed",
            error: error.message,
        });
    }};

export default auth;
