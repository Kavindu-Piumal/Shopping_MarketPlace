import ReviewModel from "../models/review.model.js";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import ChatModel from "../models/chat.model.js";
import mongoose from "mongoose";

// Add a review (only for buyers with confirmed orders)
export const addReviewController = async (req, res) => {
    try {
        const { productId, orderId, chatId, rating, comment = "" } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!productId || !orderId || !chatId || !rating) {
            return res.status(400).json({
                message: "Product ID, Order ID, Chat ID, and rating are required",
                error: true,
                success: false
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
                error: true,
                success: false
            });
        }

        // Verify the order exists and belongs to the user
        const order = await OrderModel.findOne({
            _id: orderId,
            userId: userId
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found or access denied",
                error: true,
                success: false
            });
        }

        // Verify the order contains the product
        if (order.productId.toString() !== productId) {
            return res.status(400).json({
                message: "Product not found in this order",
                error: true,
                success: false
            });
        }

        // Verify the chat exists and order is confirmed
        const chat = await ChatModel.findOne({
            _id: chatId,
            buyerId: userId,
            orderId: orderId,
            orderCompleted: true // Must be completed order
        });

        if (!chat) {
            return res.status(403).json({
                message: "You can only review products from completed orders",
                error: true,
                success: false
            });
        }

        // Check if review already exists
        const existingReview = await ReviewModel.findOne({
            productId: productId,
            userId: userId,
            orderId: orderId
        });

        if (existingReview) {
            return res.status(409).json({
                message: "You have already reviewed this product for this order",
                error: true,
                success: false
            });
        }

        // Create new review
        const newReview = new ReviewModel({
            productId,
            userId,
            orderId,
            chatId,
            rating: Number(rating),
            comment: comment.trim()
        });

        const savedReview = await newReview.save();

        // Populate the review with user details
        const populatedReview = await ReviewModel.findById(savedReview._id)
            .populate('userId', 'name')
            .populate('productId', 'name');

        return res.status(201).json({
            message: "Review added successfully",
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

// Get reviews for a product
export const getProductReviewsController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        const skip = (page - 1) * limit;

        // Get reviews with user details
        const reviews = await ReviewModel.find({
            productId: productId,
            isActive: true
        })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        // Get review statistics
        const reviewStats = await ReviewModel.aggregate([
            {
                $match: {
                    productId: new mongoose.Types.ObjectId(productId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" },
                    ratingDistribution: {
                        $push: "$rating"
                    }
                }
            }
        ]);

        // Calculate rating distribution
        let ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (reviewStats.length > 0 && reviewStats[0].ratingDistribution) {
            reviewStats[0].ratingDistribution.forEach(rating => {
                ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
            });
        }

        const stats = reviewStats.length > 0 ? {
            totalReviews: reviewStats[0].totalReviews,
            averageRating: Math.round(reviewStats[0].averageRating * 10) / 10, // Round to 1 decimal
            ratingDistribution: ratingCounts
        } : {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: ratingCounts
        };

        return res.status(200).json({
            message: "Reviews fetched successfully",
            data: {
                reviews,
                stats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(stats.totalReviews / limit),
                    hasMore: skip + reviews.length < stats.totalReviews
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

// Check if user can review a product (has completed order)
export const canUserReviewController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { orderId } = req.query; // Get orderId from query params
        const userId = req.userId;

        // If orderId is provided, check specifically for that order
        if (orderId) {
            const chat = await ChatModel.findOne({
                buyerId: userId,
                productId: productId,
                orderId: orderId,
                orderCompleted: true
            });

            if (!chat) {
                return res.status(200).json({
                    message: "Review eligibility checked",
                    data: {
                        hasReviewed: false,
                        canReview: false,
                        reason: "Order not found or not completed"
                    },
                    error: false,
                    success: true
                });
            }

            // Check if user has already reviewed this order
            const existingReview = await ReviewModel.findOne({
                productId: productId,
                userId: userId,
                orderId: orderId
            });

            return res.status(200).json({
                message: "Review eligibility checked",
                data: {
                    hasReviewed: !!existingReview,
                    canReview: !existingReview && !!chat,
                    chatId: chat ? chat._id : null
                },
                error: false,
                success: true
            });
        }

        // If no orderId provided, find all eligible orders (original behavior)
        const eligibleChats = await ChatModel.find({
            buyerId: userId,
            productId: productId,
            orderCompleted: true,
            orderId: { $exists: true }
        }).populate('orderId');

        // Check which orders don't have reviews yet
        const eligibleOrders = [];

        for (const chat of eligibleChats) {
            const existingReview = await ReviewModel.findOne({
                productId: productId,
                userId: userId,
                orderId: chat.orderId._id
            });

            if (!existingReview) {
                eligibleOrders.push({
                    orderId: chat.orderId._id,
                    chatId: chat._id,
                    orderDate: chat.orderId.createdAt
                });
            }
        }

        return res.status(200).json({
            message: "Review eligibility checked",
            data: {
                canReview: eligibleOrders.length > 0,
                eligibleOrders: eligibleOrders
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

// Update review (only by original reviewer)
export const updateReviewController = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.userId;

        // Find the review
        const review = await ReviewModel.findOne({
            _id: reviewId,
            userId: userId
        });

        if (!review) {
            return res.status(404).json({
                message: "Review not found or access denied",
                error: true,
                success: false
            });
        }

        // Update review
        const updateData = {};
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: "Rating must be between 1 and 5",
                    error: true,
                    success: false
                });
            }
            updateData.rating = Number(rating);
        }
        if (comment !== undefined) {
            updateData.comment = comment.trim();
        }

        const updatedReview = await ReviewModel.findByIdAndUpdate(
            reviewId,
            updateData,
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

// Delete review (soft delete)
export const deleteReviewController = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.userId;

        // Find and update review
        const review = await ReviewModel.findOneAndUpdate(
            {
                _id: reviewId,
                userId: userId
            },
            {
                isActive: false
            },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                message: "Review not found or access denied",
                error: true,
                success: false
            });
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
