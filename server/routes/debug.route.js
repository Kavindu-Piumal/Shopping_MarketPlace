// Get shops route for debugging purposes
import express from 'express';
import ShopModel from '../models/shop.model.js';

const debugRouter = express.Router();

// Debug route to check shop status
debugRouter.get('/shops', async (req, res) => {
  try {
    // Log request info
    console.log("Debug shop API called");
    
    // Get all shops
    const shops = await ShopModel.find().populate('owner', 'name email');
    
    // Count by status
    const activeShops = shops.filter(shop => shop.status === 'active').length;
    const pendingShops = shops.filter(shop => shop.status === 'pending').length;
    const inactiveShops = shops.filter(shop => shop.status === 'inactive').length;
    const suspendedShops = shops.filter(shop => shop.status === 'suspended').length;
    const missingStatusShops = shops.filter(shop => !shop.status).length;
    
    // Calculate status percentage
    const statusCounts = {
      active: activeShops,
      pending: pendingShops,
      inactive: inactiveShops,
      suspended: suspendedShops,
      missing: missingStatusShops
    };
    
    // Send response
    res.json({
      message: "Debug shop data",
      totalShops: shops.length,
      statusCounts,
      shops: shops.map(shop => ({
        id: shop._id,
        name: shop.name,
        status: shop.status || "missing",
        owner: shop.owner ? { id: shop.owner._id, name: shop.owner.name } : "unknown",
        createdAt: shop.createdAt
      }))
    });
  } catch (error) {
    console.error("Debug shop error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Activate all shops for testing
debugRouter.post('/activate-all-shops', async (req, res) => {
  try {
    console.log("Activate all shops API called");
    
    const result = await ShopModel.updateMany(
      {}, 
      { status: 'active' }
    );
    
    res.json({
      message: "All shops activated",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Activate shops error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test shop filtering logic
debugRouter.get('/test-filtering', async (req, res) => {
  try {
    const { status, userRole = 'admin' } = req.query;
    
    console.log('Testing filtering with:', { status, userRole });
    
    // Simulate the filtering logic
    const query = {};
    
    if (userRole === 'admin' && status && status !== 'all') {
      query.status = status;
      console.log(`Admin filtering by status: ${status}`);
    } else if (userRole === 'admin' && (!status || status === 'all')) {
      console.log('Admin viewing all shops - no status filter');
    } else {
      query.status = 'active';
      console.log('Filtering to only active shops');
    }
    
    const shops = await ShopModel.find(query);
      res.json({
      message: "Filtering test completed",
      query,
      resultCount: shops.length,
      userRole,
      requestedStatus: status,
      shops: shops.map(shop => ({
        id: shop._id,
        name: shop.name,
        status: shop.status
      }))
    });
  } catch (error) {
    console.error("Test filtering error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default debugRouter;
