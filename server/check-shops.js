// Check shops in database
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Create a simple schema to match any document
const shopSchema = new mongoose.Schema({}, { strict: false });
const ShopModel = mongoose.model('shop', shopSchema);

const main = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/abc");
        console.log("Connected to MongoDB");
        
        const shops = await ShopModel.find();
        console.log("Total shops:", shops.length);
        console.log("Shops:", JSON.stringify(shops, null, 2));
        
        // Check shops by status
        const activeShops = await ShopModel.find({ status: "active" });
        console.log("Active shops:", activeShops.length);
        
        const pendingShops = await ShopModel.find({ status: "pending" });
        console.log("Pending shops:", pendingShops.length);
        
        const inactiveShops = await ShopModel.find({ status: "inactive" });
        console.log("Inactive shops:", inactiveShops.length);
        
        const suspendedShops = await ShopModel.find({ status: "suspended" });
        console.log("Suspended shops:", suspendedShops.length);
        
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

main();
