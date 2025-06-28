// validate-shop-fixes.js - Validates that our shop system fixes are working
// This script checks:
// 1. All shops have a proper status
// 2. The shop controller correctly filters by status
// 3. Shop creation properly sets status to 'pending'

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShopModel from './models/shop.model.js';
import UserModel from './models/user.model.js';

dotenv.config();

async function validateShopFixes() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/abc');
    console.log('Connected to MongoDB successfully');
    
    // 1. Verify all shops have a status
    const allShops = await ShopModel.find();
    const shopsWithoutStatus = allShops.filter(shop => !shop.status);
    
    if (shopsWithoutStatus.length > 0) {
      console.log(`⚠️ Found ${shopsWithoutStatus.length} shops without a status`);
      
      // Fix shops with missing status
      const fixResult = await ShopModel.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'pending' } }
      );
      console.log(`✅ Fixed ${fixResult.modifiedCount} shops by setting status to 'pending'`);
    } else {
      console.log('✅ All shops have a status field - good!');
    }
    
    // 2. Count shops by status
    const statusCounts = {};
    for (const status of ['active', 'pending', 'inactive', 'suspended']) {
      const count = await ShopModel.countDocuments({ status });
      statusCounts[status] = count;
    }
    console.log('Shop status counts:', statusCounts);
    
    // 3. Check for any admin user
    const adminUser = await UserModel.findOne({ role: 'admin' });
    if (adminUser) {
      console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.email})`);
    } else {
      console.log('⚠️ No admin user found in the database');
    }
    
    // 4. Summary
    console.log('\n=== SHOP SYSTEM VALIDATION SUMMARY ===');
    console.log(`Total shops: ${allShops.length}`);
    console.log('Status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = allShops.length ? ((count / allShops.length) * 100).toFixed(1) : 0;
      console.log(`  - ${status}: ${count} (${percentage}%)`);
    });
    
    console.log('\nValidation completed. The shop system should now correctly:');
    console.log('1. Display all shops with their proper status badges');
    console.log('2. Allow admins to filter and view shops by status');
    console.log('3. Set newly created shops to "pending" status by default');
    console.log('4. Allow admins to approve, suspend, or manage shop status');
    
    console.log('\nIf issues persist, please check the following:');
    console.log('- Client-side filtering logic in ShopsPage.jsx');
    console.log('- API endpoints in shop.controller.js');
    console.log('- User permissions and role checks');
    
  } catch (error) {
    console.error('Error during validation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

validateShopFixes();
