import { Router } from "express";
import auth from "../middleware/auth.js";
import {
    getReviewEligibleProductsController,
    checkReviewEligibilityController,
    createReviewController,
    declineReviewPromptController,
    markReviewPromptShownController,
    getProductReviewsController,
    addReviewController,
    canUserReviewController,
    updateReviewController,
    deleteReviewController
} from "../controllers/review.controller.js";

const reviewRouter = Router();

// Get all products user is eligible to review
reviewRouter.get("/eligible-products", auth, getReviewEligibleProductsController);

// Check if user can review specific product
reviewRouter.get("/check-eligibility/:productId/:orderId", auth, checkReviewEligibilityController);

// Create a review
reviewRouter.post("/create", auth, createReviewController);

// Decline review prompt (user can still review later)
reviewRouter.post("/decline-prompt", auth, declineReviewPromptController);

// Mark review prompt as shown
reviewRouter.post("/mark-prompt-shown", auth, markReviewPromptShownController);

// Get product reviews and statistics (this is what CardProduct.jsx is trying to call)
reviewRouter.get("/product/:productId", getProductReviewsController);

// Add a review (for the new chat system)
reviewRouter.post("/add", auth, addReviewController);

// Check if user can review a product
reviewRouter.get("/can-review/:productId", auth, canUserReviewController);

// Update a review - Explicitly defined with correct parameter
reviewRouter.put("/update/:reviewId", auth, updateReviewController);

// Delete a review
reviewRouter.delete("/delete/:reviewId", auth, deleteReviewController);

export default reviewRouter;
