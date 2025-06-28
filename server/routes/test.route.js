// Simple test route to fetch shops
import express from 'express';
import ShopModel from '../models/shop.model.js';

const testRouter = express.Router();

// Test route to get all shops without any filtering
testRouter.get('/test-shops', async (req, res) => {
    try {
        // Find all shops regardless of status
        const shops = await ShopModel.find()
            .populate('owner', 'name email avatar');
        
        // Count shops by status
        const activeShops = shops.filter(shop => shop.status === 'active').length;
        const pendingShops = shops.filter(shop => shop.status === 'pending').length;
        const inactiveShops = shops.filter(shop => shop.status === 'inactive').length;
        const suspendedShops = shops.filter(shop => shop.status === 'suspended').length;
        
        // Return all found shops
        res.json({
            message: "All shops retrieved for testing",
            error: false,
            success: true,
            count: shops.length,
            statusCounts: {
                active: activeShops,
                pending: pendingShops,
                inactive: inactiveShops,
                suspended: suspendedShops
            },
            data: shops
        });
    } catch (error) {
        console.error("Test shops error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
});

// Test route to set all shops to active
testRouter.post('/activate-all-shops', async (req, res) => {
    try {
        // Update all shops to active status
        const result = await ShopModel.updateMany({}, { status: 'active' });
        
        res.json({
            message: "All shops set to active status",
            error: false,
            success: true,
            updated: result.modifiedCount
        });
    } catch (error) {
        console.error("Activate shops error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
});

export default testRouter;
