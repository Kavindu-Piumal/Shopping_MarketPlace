// Auto-dormancy system for shop lifecycle management
import mongoose from 'mongoose';
import ShopModel from '../models/shop.model.js';
import ProductModel from '../models/product.model.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Shop Auto-Dormancy System
 * - After 30 days of no activity → Shop goes "dormant" (hidden from public)
 * - After 60 days → Shop marked as "inactive" 
 * - After 90 days → Offer to archive or delete
 */

export const checkShopActivity = async () => {
  try {
    console.log('🔍 Checking shop activity for auto-dormancy system...');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Find shops that haven't had product updates in specified timeframes
    const shopsToMakeDormant = await ShopModel.find({
      status: 'active',
      updatedAt: { $lt: thirtyDaysAgo }
    });

    const shopsToMakeInactive = await ShopModel.find({
      status: 'dormant',
      updatedAt: { $lt: sixtyDaysAgo }
    });

    const shopsToArchive = await ShopModel.find({
      status: 'inactive',
      updatedAt: { $lt: ninetyDaysAgo }
    });

    console.log(`📊 Shop Activity Summary:`);
    console.log(`- Shops to make dormant (30+ days): ${shopsToMakeDormant.length}`);
    console.log(`- Shops to make inactive (60+ days): ${shopsToMakeInactive.length}`);
    console.log(`- Shops to archive (90+ days): ${shopsToArchive.length}`);

    // Update shop statuses
    let updatedCount = 0;

    // Make shops dormant after 30 days
    if (shopsToMakeDormant.length > 0) {
      const result = await ShopModel.updateMany(
        { 
          _id: { $in: shopsToMakeDormant.map(s => s._id) },
          status: 'active'
        },
        { 
          status: 'dormant',
          dormancyReason: 'No activity for 30+ days',
          dormancyDate: now
        }
      );
      updatedCount += result.modifiedCount;
      console.log(`💤 Made ${result.modifiedCount} shops dormant`);
    }

    // Make shops inactive after 60 days
    if (shopsToMakeInactive.length > 0) {
      const result = await ShopModel.updateMany(
        { 
          _id: { $in: shopsToMakeInactive.map(s => s._id) },
          status: 'dormant'
        },
        { 
          status: 'inactive',
          dormancyReason: 'No activity for 60+ days',
          dormancyDate: now
        }
      );
      updatedCount += result.modifiedCount;
      console.log(`😴 Made ${result.modifiedCount} shops inactive`);
    }

    // Archive shops after 90 days (mark for potential deletion)
    if (shopsToArchive.length > 0) {
      const result = await ShopModel.updateMany(
        { 
          _id: { $in: shopsToArchive.map(s => s._id) },
          status: 'inactive'
        },
        { 
          status: 'archived',
          dormancyReason: 'No activity for 90+ days - candidate for deletion',
          dormancyDate: now
        }
      );
      updatedCount += result.modifiedCount;
      console.log(`📦 Archived ${result.modifiedCount} shops (candidates for deletion)`);
    }

    console.log(`✅ Auto-dormancy check completed. Updated ${updatedCount} shops.`);
    
    return {
      dormant: shopsToMakeDormant.length,
      inactive: shopsToMakeInactive.length,
      archived: shopsToArchive.length,
      totalUpdated: updatedCount
    };

  } catch (error) {
    console.error('❌ Error in auto-dormancy system:', error);
    throw error;
  }
};

// Function to reactivate a shop when seller adds new products or updates shop
export const reactivateShop = async (shopId) => {
  try {
    const shop = await ShopModel.findById(shopId);
    
    if (!shop) {
      throw new Error('Shop not found');
    }

    // Only reactivate if shop is dormant or inactive (not suspended or archived)
    if (['dormant', 'inactive'].includes(shop.status)) {
      await ShopModel.findByIdAndUpdate(shopId, {
        status: 'active',
        $unset: { 
          dormancyReason: 1,
          dormancyDate: 1
        },
        updatedAt: new Date()
      });
      
      console.log(`🔄 Reactivated shop: ${shop.name}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error reactivating shop:', error);
    throw error;
  }
};

// Run the auto-dormancy check (can be called via cron job)
const runAutoDormancyCheck = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/abc');
    console.log('🔗 Connected to MongoDB for auto-dormancy check');
    
    const results = await checkShopActivity();
    
    console.log('📈 Auto-dormancy check results:', results);
    
  } catch (error) {
    console.error('❌ Auto-dormancy check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// If running directly, execute the check
if (import.meta.url === `file://${process.argv[1]}`) {
  runAutoDormancyCheck();
}

export default { checkShopActivity, reactivateShop };
