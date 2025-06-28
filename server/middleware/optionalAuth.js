import jwt from "jsonwebtoken";

// Optional authentication middleware - extracts user info if token exists, but doesn't block if missing
const optionalAuth = (req, res, next) => {
    try {
        const token = req.cookies.accesstoken || req?.headers?.authorization?.split(" ")[1];
        
        if (token) {
            // Token exists, try to verify it
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
                if (decoded) {
                    req.userId = decoded.id;
                    req.user = { role: decoded.role, id: decoded.id, email: decoded.email };
                    console.log(`🔐 Optional auth: User ${decoded.id} (${decoded.role}) authenticated for ${req.path}`);
                } else {
                    req.userId = null;
                    req.user = null;
                }
            } catch (tokenError) {
                // Invalid token, but don't fail the request
                console.log('⚠️ Optional auth: Invalid token, continuing as guest');
                req.userId = null;
                req.user = null;
            }
        } else {
            // No token, continue as guest
            console.log(`👤 Optional auth: No token, continuing as guest for ${req.path}`);
            req.userId = null;
            req.user = null;
        }
        
        next();
        
    } catch (error) {
        // Any error, continue as guest
        console.log('⚠️ Optional auth error:', error.message);
        req.userId = null;
        req.user = null;
        next();
    }
};

export default optionalAuth;
