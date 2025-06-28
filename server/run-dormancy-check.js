#!/usr/bin/env node

// Manual dormancy check script
// Run this manually: node run-dormancy-check.js
// Or set up as Windows scheduled task

import { checkShopActivity } from './utils/shopDormancySystem.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🏪 Manual Shop Dormancy Check');
console.log('============================');
console.log(`📅 Date: ${new Date().toLocaleString()}`);

async function runDormancyCheck() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    console.log('\n🔍 Running dormancy check...');
    const results = await checkShopActivity();
    
    console.log('\n📊 Results Summary:');
    console.log(`- Shops made dormant (30+ days): ${results.dormant}`);
    console.log(`- Shops made inactive (60+ days): ${results.inactive}`);
    console.log(`- Shops archived (90+ days): ${results.archived}`);
    console.log(`- Total shops updated: ${results.totalUpdated}`);
    
    if (results.totalUpdated > 0) {
      console.log('\n✅ Shop statuses updated successfully');
    } else {
      console.log('\n✨ No shops needed status updates');
    }
    
  } catch (error) {
    console.error('\n❌ Dormancy check failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    console.log('🏁 Dormancy check completed');
    process.exit(0);
  }
}

runDormancyCheck();
