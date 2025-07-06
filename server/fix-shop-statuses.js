// Utility script to fix shop statuses
import mongoose from "mongoose";
import dotenv from "dotenv";
import ShopModel from "./models/shop.model.js";

dotenv.config();

const fixShopStatuses = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/abc");
    console.log("Connected to MongoDB");
    
    // Find shops with missing or invalid status
    const invalidShops = await ShopModel.find({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: { $nin: ["active", "inactive", "pending", "suspended"] } }
      ]
    });
    
    console.log(`Found ${invalidShops.length} shops with invalid status`);
    
    // Fix shops with invalid status
    if (invalidShops.length > 0) {
      console.log("Fixing shop statuses...");
      const updatePromises = invalidShops.map(shop => 
        ShopModel.findByIdAndUpdate(shop._id, { status: "pending" })
      );
      
      await Promise.all(updatePromises);
      console.log("Fixed shop statuses");
    }
    
    // Count shops by status
    const activeShops = await ShopModel.countDocuments({ status: "active" });
    const pendingShops = await ShopModel.countDocuments({ status: "pending" });
    const inactiveShops = await ShopModel.countDocuments({ status: "inactive" });
    const suspendedShops = await ShopModel.countDocuments({ status: "suspended" });
    
    console.log("Status counts:");
    console.log("- Active:", activeShops);
    console.log("- Pending:", pendingShops);
    console.log("- Inactive:", inactiveShops);
    console.log("- Suspended:", suspendedShops);
    
    // Verify all shops have a status now
    const totalShops = await ShopModel.countDocuments();
    const shopsWithStatus = await ShopModel.countDocuments({ status: { $exists: true, $ne: null } });
    
    console.log(`Total shops: ${totalShops}`);
    console.log(`Shops with valid status: ${shopsWithStatus}`);
    
    if (totalShops === shopsWithStatus) {
      console.log("All shops have valid status values ✅");
    } else {
      console.log("Some shops still have invalid status! ❌");
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

fixShopStatuses();
