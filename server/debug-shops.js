// Debug utility to be run from terminal
// This script will check shop status in the database

import mongoose from "mongoose";
import dotenv from "dotenv";
import ShopModel from "./models/shop.model.js";

dotenv.config();

const debugShops = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/abc");
    console.log("Connected to MongoDB");
    
    // Count all shops
    const totalShops = await ShopModel.countDocuments();
    console.log(`Total shops in database: ${totalShops}`);
    
    // Count shops by status
    const activeShops = await ShopModel.countDocuments({ status: "active" });
    const pendingShops = await ShopModel.countDocuments({ status: "pending" });
    const inactiveShops = await ShopModel.countDocuments({ status: "inactive" });
    const suspendedShops = await ShopModel.countDocuments({ status: "suspended" });
    const missingStatusShops = await ShopModel.countDocuments({ status: { $exists: false } });
    
    console.log("\nShop Status Counts:");
    console.log(`- Active: ${activeShops}`);
    console.log(`- Pending: ${pendingShops}`);
    console.log(`- Inactive: ${inactiveShops}`);
    console.log(`- Suspended: ${suspendedShops}`);
    console.log(`- Missing status: ${missingStatusShops}`);
    
    // If no shops are active, update the first shop to active
    if (activeShops === 0 && totalShops > 0) {
      console.log("\nNo active shops found. Activating first shop for testing...");
      const firstShop = await ShopModel.findOne().sort({ createdAt: 1 });
      if (firstShop) {
        const originalStatus = firstShop.status || "none";
        firstShop.status = "active";
        await firstShop.save();
        console.log(`Shop "${firstShop.name}" status updated from "${originalStatus}" to "active"`);
      }
    }
    
    // Print shop details
    console.log("\nShop details:");
    const shops = await ShopModel.find().sort({ createdAt: -1 }).limit(10);
    shops.forEach((shop, index) => {
      console.log(`\nShop #${index + 1}: ${shop.name}`);
      console.log(`- ID: ${shop._id}`);
      console.log(`- Status: ${shop.status || "undefined"}`);
      console.log(`- Owner: ${shop.owner}`);
      console.log(`- Created: ${shop.createdAt}`);
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

// Run the function
debugShops();
