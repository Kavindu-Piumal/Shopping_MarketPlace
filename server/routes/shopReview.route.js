import { Router } from "express";
import auth from "../middleware/auth.js";
import {
    addShopReviewController,
    getShopReviewsController,
    canUserReviewShopController,
    updateShopReviewController,
    deleteShopReviewController
} from "../controllers/shopReview.controller.js";

const shopReviewRouter = Router();

// Add a shop review (authenticated users only)
shopReviewRouter.post("/add", auth, addShopReviewController);

// Get reviews for a shop (public)
shopReviewRouter.get("/shop/:shopId", getShopReviewsController);

// Check if user can review a shop (authenticated users only)
shopReviewRouter.get("/can-review/:shopId", auth, canUserReviewShopController);

// Update a shop review (authenticated users only)
shopReviewRouter.put("/update/:reviewId", auth, updateShopReviewController);

// Delete a shop review (authenticated users only)
shopReviewRouter.delete("/delete/:reviewId", auth, deleteShopReviewController);

export default shopReviewRouter;
