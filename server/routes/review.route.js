import { Router } from "express";
import auth from "../middleware/auth.js";
import {
    addReviewController,
    getProductReviewsController,
    canUserReviewController,
    updateReviewController,
    deleteReviewController
} from "../controllers/review.controller.js";

const reviewRouter = Router();

// Add a review (authenticated users only)
reviewRouter.post("/add", auth, addReviewController);

// Get reviews for a product (public)
reviewRouter.get("/product/:productId", getProductReviewsController);

// Check if user can review a product (authenticated users only)
reviewRouter.get("/can-review/:productId", auth, canUserReviewController);

// Update a review (authenticated users only)
reviewRouter.put("/update/:reviewId", auth, updateReviewController);

// Delete a review (authenticated users only)
reviewRouter.delete("/delete/:reviewId", auth, deleteReviewController);

export default reviewRouter;
