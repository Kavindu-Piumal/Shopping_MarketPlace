import { Router } from 'express';
import auth from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';
import {
    createShopController,
    getAllShopsController,
    getShopByIdController,
    getMyShopController,
    updateShopController,
    getShopCategoriesController,
    deleteShopController,
    updateShopStatusController,
    uploadShopImageController,
    deactivateShopController,
    reactivateShopController,
    getShopLifecycleInfoController
} from '../controllers/shop.controller.js';

const shopRouter = Router();

// Public routes
shopRouter.get('/categories', getShopCategoriesController);

// Semi-public routes - accessible to both authenticated and unauthenticated users
shopRouter.get('/all', optionalAuth, getAllShopsController);

// Protected routes
shopRouter.get('/my/shop', auth, getMyShopController);
shopRouter.get('/my/lifecycle', auth, getShopLifecycleInfoController);
shopRouter.post('/create', auth, createShopController);
shopRouter.put('/update', auth, updateShopController);
shopRouter.put('/upload-image', auth, uploadShopImageController);
shopRouter.put('/deactivate', auth, deactivateShopController);
shopRouter.put('/reactivate', auth, reactivateShopController);
shopRouter.delete('/delete', auth, deleteShopController);
shopRouter.put('/update-status/:shopId', auth, updateShopStatusController);
shopRouter.delete('/:shopId', auth, deleteShopController);

// Dynamic routes (must be last to avoid conflicts)
shopRouter.get('/:shopId', getShopByIdController);

export default shopRouter;
