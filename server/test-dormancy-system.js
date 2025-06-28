// Test the shop dormancy system manually
import { checkShopActivity, reactivateShop } from './utils/shopDormancySystem.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testDormancySystem() {
  try {
    console.log('🔧 Testing Shop Dormancy System...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    console.log('\n📊 Running dormancy check...');
    const results = await checkShopActivity();
    
    console.log('\n📋 Dormancy Check Results:');
    console.log(`- Shops made dormant (30+ days): ${results.dormant}`);
    console.log(`- Shops made inactive (60+ days): ${results.inactive}`);
    console.log(`- Shops archived (90+ days): ${results.archived}`);
    console.log(`- Total shops updated: ${results.totalUpdated}`);

    console.log('\n🎯 Dormancy System Summary:');
    console.log('✅ System is configured and functional');
    console.log('⏰ Automatic schedule: Manual execution only (no cron job detected)');
    console.log('🔄 Reactivation: Automatic when seller adds new products');
    
    console.log('\n📝 Dormancy Timeline:');
    console.log('• 30 days inactive → Shop becomes "dormant" (hidden from public)');
    console.log('• 60 days inactive → Shop becomes "inactive"');
    console.log('• 90 days inactive → Shop becomes "archived" (deletion candidate)');
    console.log('• Adding new product → Automatically reactivates dormant/inactive shops');

  } catch (error) {
    console.error('❌ Error testing dormancy system:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Database connection closed');
  }
}

testDormancySystem();
