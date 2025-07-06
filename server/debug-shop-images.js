// Debug utility to check shop banners and logos
import mongoose from "mongoose";
import dotenv from "dotenv";
import ShopModel from "./models/shop.model.js";

dotenv.config();

const debugShopImages = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/abc");
    console.log("Connected to MongoDB");
    
    // Find all shops
    const shops = await ShopModel.find().sort({ createdAt: -1 });
    console.log(`Found ${shops.length} shops`);
    
    console.log("\n=== SHOP IMAGE ANALYSIS ===");
    
    shops.forEach((shop, index) => {
      console.log(`\n--- Shop #${index + 1}: ${shop.name} ---`);
      console.log(`ID: ${shop._id}`);
      console.log(`Status: ${shop.status || "undefined"}`);
      console.log(`Owner: ${shop.owner}`);
      
      // Check banner
      if (shop.banner) {
        console.log(`✅ Banner: YES`);
        console.log(`   URL: ${shop.banner}`);
        console.log(`   Length: ${shop.banner.length} chars`);
        console.log(`   Starts with http: ${shop.banner.startsWith('http')}`);
        console.log(`   Contains cloudinary: ${shop.banner.includes('cloudinary')}`);
      } else {
        console.log(`❌ Banner: NO`);
      }
      
      // Check logo
      if (shop.logo) {
        console.log(`✅ Logo: YES`);
        console.log(`   URL: ${shop.logo}`);
        console.log(`   Length: ${shop.logo.length} chars`);
        console.log(`   Starts with http: ${shop.logo.startsWith('http')}`);
        console.log(`   Contains cloudinary: ${shop.logo.includes('cloudinary')}`);
      } else {
        console.log(`❌ Logo: NO`);
      }
      
      console.log(`Created: ${shop.createdAt}`);
      console.log(`Updated: ${shop.updatedAt}`);
    });
    
    // Summary
    const shopsWithBanner = shops.filter(shop => shop.banner).length;
    const shopsWithLogo = shops.filter(shop => shop.logo).length;
    
    console.log("\n=== SUMMARY ===");
    console.log(`Total shops: ${shops.length}`);
    console.log(`Shops with banner: ${shopsWithBanner}`);
    console.log(`Shops with logo: ${shopsWithLogo}`);
    
    if (shopsWithBanner > 0) {
      console.log("\n=== SAMPLE BANNER URLS ===");
      shops.filter(shop => shop.banner).slice(0, 3).forEach((shop, index) => {
        console.log(`${index + 1}. ${shop.name}: ${shop.banner}`);
      });
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

// Run the function
debugShopImages();
