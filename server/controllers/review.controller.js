import ReviewModel from "../models/review.model.js";
import ReviewEligibilityModel from "../models/reviewEligibility.model.js";
import ProductModel from "../models/product.model.js";
import OrderModel from "../models/order.model.js";
import ChatModel from "../models/chat.model.js"; // Add this import for ChatModel
import mongoose from "mongoose";

// Get all products that user is eligible to review
export const getReviewEligibleProductsController = async (req, res) => {
    try {
        const userId = req.userId;

        // Get all products user is eligible to review (has completed orders but not reviewed)
        const eligibleProducts = await ReviewEligibilityModel.find({
            userId: userId,
            hasReviewed: false
        })
        .populate('productId', 'name image price')
        .populate('orderId', 'orderId totalAmt')
        .sort({ orderCompletedAt: -1 });

        return res.status(200).json({
            message: "Review eligible products fetched successfully",
            data: eligibleProducts,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Check if user can review specific product
export const checkReviewEligibilityController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, orderId } = req.params;

        const eligibility = await ReviewEligibilityModel.findOne({
            userId: userId,
            productId: productId,
            orderId: orderId
        });

        if (!eligibility) {
            return res.status(404).json({
                message: "You are not eligible to review this product",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Review eligibility checked successfully",
            data: {
                canReview: !eligibility.hasReviewed,
                hasReviewed: eligibility.hasReviewed,
                orderCompletedAt: eligibility.orderCompletedAt,
                reviewId: eligibility.reviewId
            },
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Create a review - BUYER ONLY
export const createReviewController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, orderId, chatId, rating, comment } = req.body;

        // CRITICAL: Verify user is eligible to review this product (must be a buyer)
        const eligibility = await ReviewEligibilityModel.findOne({
            userId: userId,
            productId: productId,
            orderId: orderId
        });

        if (!eligibility) {
            return res.status(403).json({
                message: "You are not eligible to review this product. Only buyers who have completed orders can add reviews.",
                error: true,
                success: false
            });
        }

        if (eligibility.hasReviewed) {
            return res.status(400).json({
                message: "You have already reviewed this product for this order",
                error: true,
                success: false
            });
        }

        // ADDITIONAL SECURITY: Verify the product doesn't belong to this user (prevent self-reviews)
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        if (product.sellerId.toString() === userId) {
            return res.status(403).json({
                message: "You cannot review your own product",
                error: true,
                success: false
            });
        }

        // ADDITIONAL SECURITY: Verify the order belongs to this user
        const order = await OrderModel.findById(orderId);
        if (!order || order.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You can only review products from your own completed orders",
                error: true,
                success: false
            });
        }

        // Create the review
        const newReview = new ReviewModel({
            productId: productId,
            userId: userId,
            orderId: orderId,
            chatId: chatId,
            rating: rating,
            comment: comment || "",
            isVerifiedPurchase: true
        });

        const savedReview = await newReview.save();

        // Update eligibility record
        await ReviewEligibilityModel.findByIdAndUpdate(eligibility._id, {
            hasReviewed: true,
            reviewId: savedReview._id
        });

        // Update product average rating
        await updateProductAverageRating(productId);

        const populatedReview = await ReviewModel.findById(savedReview._id)
            .populate('userId', 'name')
            .populate('productId', 'name');

        return res.status(201).json({
            message: "Review created successfully",
            data: populatedReview,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Handle review prompt decline
export const declineReviewPromptController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, orderId } = req.body;

        // Update eligibility record to mark review prompt as declined
        const eligibility = await ReviewEligibilityModel.findOneAndUpdate(
            {
                userId: userId,
                productId: productId,
                orderId: orderId
            },
            {
                reviewDeclined: true,
                reviewDeclinedAt: new Date(),
                reviewPromptShown: true,
                reviewPromptShownAt: new Date()
            },
            { new: true }
        );

        if (!eligibility) {
            return res.status(404).json({
                message: "Review eligibility not found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Review prompt declined successfully. You can still add a review later from your account.",
            data: eligibility,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Mark review prompt as shown
export const markReviewPromptShownController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, orderId } = req.body;

        await ReviewEligibilityModel.findOneAndUpdate(
            {
                userId: userId,
                productId: productId,
                orderId: orderId
            },
            {
                reviewPromptShown: true,
                reviewPromptShownAt: new Date()
            }
        );

        return res.status(200).json({
            message: "Review prompt marked as shown",
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Get product reviews and statistics
export const getProductReviewsController = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Convert productId to ObjectId for proper MongoDB matching
        const productObjectId = new mongoose.Types.ObjectId(productId);

        // Get all reviews for this product
        const reviews = await ReviewModel.find({
            productId: productObjectId,
            isActive: true
        })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        // Get review statistics
        const totalReviews = await ReviewModel.countDocuments({
            productId: productObjectId,
            isActive: true
        });

        // Calculate average rating and rating distribution
        const ratingStats = await ReviewModel.aggregate([
            { $match: { productId: productObjectId, isActive: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    ratings: {
                        $push: "$rating"
                    }
                }
            }
        ]);

        // Calculate rating distribution
        let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (ratingStats.length > 0) {
            ratingStats[0].ratings.forEach(rating => {
                ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
            });
        }

        const stats = {
            totalReviews,
            averageRating: ratingStats.length > 0 ? parseFloat(ratingStats[0].averageRating.toFixed(1)) : 0,
            ratingDistribution
        };

        return res.status(200).json({
            message: "Product reviews fetched successfully",
            data: {
                reviews,
                stats,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalReviews / limit),
                    totalReviews,
                    limit,
                    hasMore: page < Math.ceil(totalReviews / limit)
                }
            },
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Add a review (for the new chat system)
export const addReviewController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, orderId, chatId, rating, comment } = req.body;

        console.log('📝 Review submission received:', {
            userId,
            productId,
            orderId,
            chatId,
            rating,
            commentLength: comment?.length || 0
        });

        // Validate required fields
        if (!productId || !rating) {
            return res.status(400).json({
                message: "Product ID and rating are required",
                error: true,
                success: false
            });
        }

        // If no chatId provided, try to find it from the order
        let reviewChatId = chatId;
        if (!reviewChatId && orderId) {
            console.log('🔍 Looking for chat associated with order:', orderId);
            try {
                const chatWithOrder = await ChatModel.findOne({ orderId: orderId });
                if (chatWithOrder) {
                    reviewChatId = chatWithOrder._id;
                    console.log('✅ Found chat for order:', reviewChatId);
                } else {
                    console.log('⚠️ No chat found for order, creating review without chat reference');
                }
            } catch (error) {
                console.log('❌ Error finding chat for order:', error.message);
            }
        }

        // Check if user has already reviewed this product for this order
        const existingReview = await ReviewModel.findOne({
            productId,
            userId,
            orderId
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this product for this order",
                error: true,
                success: false
            });
        }

        // Create new review - handle case where chatId might be missing
        const reviewData = {
            productId,
            userId,
            orderId,
            rating,
            comment: comment || "",
            isVerifiedPurchase: !!orderId
        };

        // Only add chatId if we have one
        if (reviewChatId) {
            reviewData.chatId = reviewChatId;
        }

        console.log('📝 Creating review with data:', reviewData);

        const newReview = new ReviewModel(reviewData);
        const savedReview = await newReview.save();

        console.log('✅ Review saved successfully:', savedReview._id);

        // Update review eligibility if exists
        if (orderId) {
            await ReviewEligibilityModel.findOneAndUpdate(
                { userId, productId, orderId },
                {
                    hasReviewed: true,
                    reviewId: savedReview._id,
                    reviewedAt: new Date()
                }
            );
        }

        return res.status(201).json({
            message: "Review added successfully",
            data: savedReview,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('❌ Error in addReviewController:', error);
        return res.status(500).json({
            message: error.message || "Failed to add review",
            error: true,
            success: false
        });
    }
};

// Check if user can review a product
export const canUserReviewController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;
        const { orderId } = req.query;

        // Check if user has already reviewed this product
        const existingReview = await ReviewModel.findOne({
            productId,
            userId,
            ...(orderId && { orderId })
        });

        if (existingReview) {
            return res.status(200).json({
                message: "User has already reviewed this product",
                data: { canReview: false, hasReviewed: true },
                error: false,
                success: true
            });
        }

        // If orderId is provided, check eligibility
        if (orderId) {
            const eligibility = await ReviewEligibilityModel.findOne({
                userId,
                productId,
                orderId
            });

            return res.status(200).json({
                message: "Review eligibility checked",
                data: {
                    canReview: !!eligibility && !eligibility.hasReviewed,
                    hasReviewed: eligibility?.hasReviewed || false,
                    isEligible: !!eligibility
                },
                error: false,
                success: true
            });
        }

        // If no orderId, user can potentially review (but won't be verified purchase)
        return res.status(200).json({
            message: "User can review this product",
            data: { canReview: true, hasReviewed: false },
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Update a review - NEW CONTROLLER
export const updateReviewController = async (req, res) => {
    try {
        const userId = req.userId;
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        // Validate input
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
                error: true,
                success: false
            });
        }

        // Find the review and verify ownership
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        // Check if user owns this review
        if (review.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You can only update your own reviews",
                error: true,
                success: false
            });
        }

        // Update the review
        const updatedReview = await ReviewModel.findByIdAndUpdate(
            reviewId,
            {
                rating: Number(rating),
                comment: comment.trim(),
                updatedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'name');

        return res.status(200).json({
            message: "Review updated successfully",
            data: updatedReview,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Delete a review - NEW CONTROLLER
export const deleteReviewController = async (req, res) => {
    try {
        const userId = req.userId;
        const { reviewId } = req.params;

        // Find the review and verify ownership
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        // Check if user owns this review
        if (review.userId.toString() !== userId) {
            return res.status(403).json({
                message: "You can only delete your own reviews",
                error: true,
                success: false
            });
        }

        // Delete the review
        await ReviewModel.findByIdAndDelete(reviewId);

        // Update review eligibility to allow re-reviewing if needed
        if (review.orderId) {
            await ReviewEligibilityModel.findOneAndUpdate(
                {
                    userId: userId,
                    productId: review.productId,
                    orderId: review.orderId
                },
                {
                    hasReviewed: false,
                    reviewId: null
                }
            );
        }

        return res.status(200).json({
            message: "Review deleted successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Helper function to update product average rating
async function updateProductAverageRating(productId) {
    try {
        const reviews = await ReviewModel.find({
            productId: productId,
            isActive: true
        });

        if (reviews.length === 0) {
            await ProductModel.findByIdAndUpdate(productId, {
                averageRating: 0,
                totalReviews: 0
            });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        await ProductModel.findByIdAndUpdate(productId, {
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length
        });

    } catch (error) {
        console.error('Error updating product average rating:', error);
    }
}
