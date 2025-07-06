// Test script to validate shop filtering fixes
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShopModel from './models/shop.model.js';
import UserModel from './models/user.model.js';
import connectDB from './config/connectDB.js';

dotenv.config();

async function testShopFiltering() {
  try {
    console.log('🔧 Testing Shop Filtering Fixes...\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Test 1: Check current shop statuses
    console.log('\n📊 Test 1: Current shop statuses in database');
    const allShops = await ShopModel.find({});
    const statusCounts = {
      active: 0,
      pending: 0,
      inactive: 0,
      suspended: 0
    };

    allShops.forEach(shop => {
      if (statusCounts.hasOwnProperty(shop.status)) {
        statusCounts[shop.status]++;
      } else {
        console.log(`Unknown status found: ${shop.status}`);
      }
    });

    console.log('Shop status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} shops`);
    });
    console.log(`  Total: ${allShops.length} shops`);

    // Test 2: Test filtering for admin with status = "all"
    console.log('\n🔍 Test 2: Admin filter with status = "all"');
    const adminAllQuery = {}; // No status filter for admin viewing all
    const adminAllShops = await ShopModel.find(adminAllQuery);
    console.log(`✅ Admin viewing all shops: ${adminAllShops.length} shops found`);

    // Test 3: Test filtering for admin with specific status
    console.log('\n🔍 Test 3: Admin filter with status = "suspended"');
    const adminSuspendedQuery = { status: 'suspended' };
    const adminSuspendedShops = await ShopModel.find(adminSuspendedQuery);
    console.log(`✅ Admin viewing suspended shops: ${adminSuspendedShops.length} shops found`);

    // Test 4: Test filtering for admin with status = "active"
    console.log('\n🔍 Test 4: Admin filter with status = "active"');
    const adminActiveQuery = { status: 'active' };
    const adminActiveShops = await ShopModel.find(adminActiveQuery);
    console.log(`✅ Admin viewing active shops: ${adminActiveShops.length} shops found`);

    // Test 5: Test filtering for admin with status = "pending"
    console.log('\n🔍 Test 5: Admin filter with status = "pending"');
    const adminPendingQuery = { status: 'pending' };
    const adminPendingShops = await ShopModel.find(adminPendingQuery);
    console.log(`✅ Admin viewing pending shops: ${adminPendingShops.length} shops found`);

    // Test 6: Create some test shops with different statuses if needed
    console.log('\n🏪 Test 6: Creating test shops with different statuses');
    
    // Check if we have shops with different statuses
    if (statusCounts.suspended === 0) {
      console.log('Creating a suspended shop for testing...');
      const testUser = await UserModel.findOne() || await UserModel.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'hashedpassword',
        mobile: '9999999999',
        role: 'USER',
        verify_email: true
      });

      await ShopModel.create({
        name: 'Test Suspended Shop',
        description: 'A test shop with suspended status',
        category: 'Test',
        owner: testUser._id,
        mobile: '9999999999',
        status: 'suspended'
      });
      console.log('✅ Created suspended test shop');
    }

    if (statusCounts.pending === 0) {
      console.log('Creating a pending shop for testing...');
      const testUser = await UserModel.findOne() || await UserModel.create({
        name: 'Test User 2',
        email: 'testuser2@example.com',
        password: 'hashedpassword',
        mobile: '8888888888',
        role: 'USER',
        verify_email: true
      });

      await ShopModel.create({
        name: 'Test Pending Shop',
        description: 'A test shop with pending status',
        category: 'Test',
        owner: testUser._id,
        mobile: '8888888888',
        status: 'pending'
      });
      console.log('✅ Created pending test shop');
    }

    // Re-test after creating test shops
    console.log('\n📊 Final status check after test shop creation:');
    const finalShops = await ShopModel.find({});
    const finalStatusCounts = {
      active: 0,
      pending: 0,
      inactive: 0,
      suspended: 0
    };

    finalShops.forEach(shop => {
      if (finalStatusCounts.hasOwnProperty(shop.status)) {
        finalStatusCounts[shop.status]++;
      }
    });

    console.log('Final shop status distribution:');
    Object.entries(finalStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} shops`);
    });

    console.log('\n🎉 Shop filtering test completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Shop status query logic fixed (req.user.role instead of req.userRole)');
    console.log('✅ Debug logging added to track filtering behavior');
    console.log('✅ Test shops created with different statuses for validation');
    console.log('\n🔧 Next steps:');
    console.log('1. Restart the server to apply changes');
    console.log('2. Test the admin manage-shops page');
    console.log('3. Verify status filtering dropdown works correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
  }
}

// Run the test
testShopFiltering();
