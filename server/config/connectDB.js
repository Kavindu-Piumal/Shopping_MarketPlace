import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

if(!process.env.MONGO_URI){
    throw new Error(
        "Please provide MONGO_URI in the .env file"
    )
}

async function connectDB() {
    try {
        console.log("Attempting to connect to MongoDB Atlas...");
        
        // Simple connection with basic timeout options
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 30000, // 30 seconds
        });
        
        console.log("MongoDB connected successfully");
        console.log("Database name:", mongoose.connection.name);
    }
    catch (error) {
        console.error("MongoDB connection failed:", error.message);
        
        // If the error suggests network issues, provide helpful info
        if (error.message.includes('ENOTFOUND') || 
            error.message.includes('timeout') || 
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('MongoNetworkError')) {
            
            console.error("\n🔥 NETWORK CONNECTION ISSUE DETECTED 🔥");
            console.error("This is likely due to:");
            console.error("1. University/Corporate firewall blocking MongoDB port (27017)");
            console.error("2. IP address not whitelisted in MongoDB Atlas");
            console.error("3. Network policy restrictions");
            console.error("\nSolutions:");
            console.error("1. Use mobile data/hotspot temporarily");
            console.error("2. Contact university IT about MongoDB Atlas access");
            console.error("3. Use a VPN");
            console.error("4. Set up local MongoDB for development");
            console.error("\nFor now, the server will continue without database...\n");
            
            // In development, don't crash the server
            if (process.env.NODE_ENV !== 'production') {
                console.warn("⚠️  Server running WITHOUT database connection");
                console.warn("You can still test frontend features that don't require database");
                return;
            }
        }
        
        process.exit(1); // Exit the process with failure
    }
}

export default connectDB;