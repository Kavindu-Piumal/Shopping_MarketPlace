// test-shop-integration.js - Script to verify shop system integration
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShopModel from './models/shop.model.js';

dotenv.config();

async function testShopIntegration() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/abc');
    console.log('Connected to MongoDB successfully');
    
    // 1. Check all shops and their statuses
    const allShops = await ShopModel.find().populate('owner', 'name email role');
    console.log(`Found ${allShops.length} total shops in the database`);
    
    // 2. Count shops by status
    const statusCounts = allShops.reduce((acc, shop) => {
      const status = shop.status || 'missing';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    console.log('Shop status counts:', statusCounts);
    
    // 3. Check if any shops have missing status
    const missingStatusShops = allShops.filter(shop => !shop.status);
    if (missingStatusShops.length > 0) {
      console.log(`WARNING: Found ${missingStatusShops.length} shops with missing status`);
      console.log('Shop IDs with missing status:', missingStatusShops.map(s => s._id));
      
      // 4. Fix shops with missing status
      console.log('Fixing shops with missing status...');
      const updateResult = await ShopModel.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'pending' } }
      );
      console.log(`Updated ${updateResult.modifiedCount} shops with missing status`);
    } else {
      console.log('All shops have proper status fields. No fixes needed.');
    }
    
    // 5. Verify shops by owner role
    const shopsByOwnerRole = allShops.reduce((acc, shop) => {
      const role = shop.owner?.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    console.log('Shops by owner role:', shopsByOwnerRole);
    
    // 6. Check for any inconsistencies - sellers without shops or shops without seller owners
    const sellersWithoutShops = await mongoose.model('user').find(
      { role: 'seller', _id: { $nin: allShops.map(s => s.owner?._id).filter(id => id) } }
    );
    console.log(`Found ${sellersWithoutShops.length} users with seller role but no shop`);
    
    console.log('Shop integration test completed successfully');
  } catch (error) {
    console.error('Error during shop integration test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testShopIntegration();
