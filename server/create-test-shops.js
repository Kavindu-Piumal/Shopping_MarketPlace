// Create test shops with different statuses to verify filtering
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShopModel from './models/shop.model.js';
import UserModel from './models/user.model.js';
import connectDB from './config/connectDB.js';

dotenv.config();

async function createTestShops() {
  try {
    console.log('🔧 Creating test shops with different statuses...\n');
    
    await connectDB();
    console.log('✅ Connected to database');

    // Create test users if they don't exist
    let testUsers = await UserModel.find({ 
      email: { $in: ['testuser1@example.com', 'testuser2@example.com'] }
    });

    if (testUsers.length < 2) {
      console.log('Creating test users...');
      await UserModel.deleteMany({ 
        email: { $in: ['testuser1@example.com', 'testuser2@example.com'] }
      });
      
      testUsers = await UserModel.insertMany([
        {
          name: 'Test User 1',
          email: 'testuser1@example.com',
          password: 'hashedpassword123',
          mobile: '1111111111',
          role: 'USER',
          verify_email: true
        },
        {
          name: 'Test User 2', 
          email: 'testuser2@example.com',
          password: 'hashedpassword123',
          mobile: '2222222222',
          role: 'USER',
          verify_email: true
        }
      ]);
      console.log('✅ Created test users');
    }

    // Delete existing test shops
    await ShopModel.deleteMany({ 
      name: { $in: ['Test Pending Shop', 'Test Suspended Shop'] }
    });

    // Create shops with different statuses
    const testShops = [
      {
        name: 'Test Pending Shop',
        description: 'A test shop with pending status for filtering test',
        category: 'Test Category',
        owner: testUsers[0]._id,
        mobile: '1111111111',
        status: 'pending'
      },
      {
        name: 'Test Suspended Shop', 
        description: 'A test shop with suspended status for filtering test',
        category: 'Test Category',
        owner: testUsers[1]._id,
        mobile: '2222222222',
        status: 'suspended'
      }
    ];

    const createdShops = await ShopModel.insertMany(testShops);
    console.log(`✅ Created ${createdShops.length} test shops with different statuses`);

    // Check final status distribution
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
      }
    });

    console.log('\n📊 Final shop status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} shops`);
    });
    console.log(`  Total: ${allShops.length} shops`);

    console.log('\n🎉 Test shops created successfully!');
    console.log('\n🔧 Now restart your server and test:');
    console.log('1. Go to /dashboard/manage-shops as admin');
    console.log('2. Try "All Statuses" - should show all shops');
    console.log('3. Try "Pending" - should show pending shops');
    console.log('4. Try "Suspended" - should show suspended shops');
    console.log('5. Try "Active" - should show active shops');

  } catch (error) {
    console.error('❌ Error creating test shops:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
  }
}

createTestShops();
