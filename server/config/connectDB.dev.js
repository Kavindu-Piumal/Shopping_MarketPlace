import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Alternative connection configurations for different environments
const getConnectionString = () => {
    // If MONGO_URI is available (mobile data/home network), use it
    if (process.env.MONGO_URI) {
        return process.env.MONGO_URI;
    }
    
    // Fallback for university/restricted networks
    if (process.env.MONGO_URI_LOCAL) {
        return process.env.MONGO_URI_LOCAL;
    }
    
    // Default local MongoDB connection
    return "mongodb://localhost:27017/ecommerce-dev";
};

async function connectDB() {
    try {
        const connectionString = getConnectionString();
        console.log("Attempting to connect to MongoDB...");
        console.log("Connection type:", connectionString.includes('localhost') ? 'Local' : 'Atlas');
        
        await mongoose.connect(connectionString, {
            // Add connection options that might help with university networks
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            family: 4, // Use IPv4, skip trying IPv6
        });
        
        console.log("MongoDB connected successfully");
        console.log("Database:", mongoose.connection.name);
    }
    catch (error) {
        console.error("MongoDB connection failed:", error.message);
        
        // If Atlas connection fails, try local fallback
        if (!error.message.includes('localhost')) {
            console.log("Attempting fallback to local MongoDB...");
            try {
                await mongoose.connect("mongodb://localhost:27017/ecommerce-dev", {
                    serverSelectionTimeoutMS: 5000,
                });
                console.log("Connected to local MongoDB successfully");
                return;
            } catch (localError) {
                console.error("Local MongoDB also failed:", localError.message);
            }
        }
        
        console.error("All database connection attempts failed. Please check:");
        console.error("1. Your network connection");
        console.error("2. MongoDB Atlas IP whitelist");
        console.error("3. University firewall settings");
        console.error("4. Local MongoDB installation");
        
        // Don't exit in development, continue without database
        if (process.env.NODE_ENV !== 'production') {
            console.warn("Running in development mode without database connection");
            return;
        }
        
        process.exit(1);
    }
}

export default connectDB;
