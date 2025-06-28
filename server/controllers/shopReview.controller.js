import ShopReviewModel from "../models/shopReview.model.js";
import OrderModel from "../models/order.model.js";
import ShopModel from "../models/shop.model.js";
import ChatModel from "../models/chat.model.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";

// Add a shop review (only for buyers with completed orders from the shop)
export const addShopReviewController = async (req, res) => {
    try {
        const { shopId, orderId, chatId, rating, comment = "", aspects = {} } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!shopId || !orderId || !chatId || !rating) {
            return res.status(400).json({
                message: "Shop ID, Order ID, Chat ID, and rating are required",
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

        // Get product to find the shop
        const product = await ProductModel.findById(order.productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found for this order",
                error: true,
                success: false
            });
        }

        // Find the shop by seller ID
        const shop = await ShopModel.findOne({ owner: product.sellerId });
        if (!shop || shop._id.toString() !== shopId) {
            return res.status(400).json({
                message: "Shop not found or doesn't match the order",
                error: true,
                success: false
            });
        }

        // Verify the chat exists and order is confirmed
        const chat = await ChatModel.findOne({
            _id: chatId,
            buyerId: userId,
            orderId: orderId,
            orderCompleted: true
        });

        if (!chat) {
            return res.status(403).json({
                message: "You can only review shops from completed orders",
                error: true,
                success: false
            });
        }

        // Check if review already exists
        const existingReview = await ShopReviewModel.findOne({
            shopId: shopId,
            userId: userId,
            orderId: orderId
        });

        if (existingReview) {
            return res.status(409).json({
                message: "You have already reviewed this shop for this order",
                error: true,
                success: false
            });
        }

        // Create new shop review
        const newReview = new ShopReviewModel({
            shopId,
            userId,
            orderId,
            chatId,
            rating: Number(rating),
            comment: comment.trim(),
            aspects
        });

        const savedReview = await newReview.save();

        // Update shop rating and review count
        await updateShopRatingStats(shopId);

        // Populate the review with user details
        const populatedReview = await ShopReviewModel.findById(savedReview._id)
            .populate('userId', 'name')
            .populate('shopId', 'name');

        return res.status(201).json({
            message: "Shop review added successfully",
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

// Get reviews for a shop
export const getShopReviewsController = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!shopId) {
            return res.status(400).json({
                message: "Shop ID is required",
                error: true,
                success: false
            });
        }

        const skip = (page - 1) * limit;

        // Get reviews with user details
        const reviews = await ShopReviewModel.find({
            shopId: shopId,
            isActive: true
        })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        // Get review statistics
        const reviewStats = await ShopReviewModel.aggregate([
            {
                $match: {
                    shopId: new mongoose.Types.ObjectId(shopId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" },
                    averageCommunication: { $avg: "$aspects.communication" },
                    averageProductQuality: { $avg: "$aspects.productQuality" },
                    averageShipping: { $avg: "$aspects.shipping" },
                    averageService: { $avg: "$aspects.service" },
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
            averageRating: Math.round(reviewStats[0].averageRating * 10) / 10,
            aspectAverages: {
                communication: Math.round((reviewStats[0].averageCommunication || 0) * 10) / 10,
                productQuality: Math.round((reviewStats[0].averageProductQuality || 0) * 10) / 10,
                shipping: Math.round((reviewStats[0].averageShipping || 0) * 10) / 10,
                service: Math.round((reviewStats[0].averageService || 0) * 10) / 10,
            },
            ratingDistribution: ratingCounts
        } : {
            totalReviews: 0,
            averageRating: 0,
            aspectAverages: {
                communication: 0,
                productQuality: 0,
                shipping: 0,
                service: 0,
            },
            ratingDistribution: ratingCounts
        };

        return res.status(200).json({
            message: "Shop reviews fetched successfully",
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

// Check if user can review a shop (has completed order from the shop)
export const canUserReviewShopController = async (req, res) => {
    try {
        const { shopId } = req.params;
        const userId = req.userId;

        // Find shop
        const shop = await ShopModel.findById(shopId);
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                error: true,
                success: false
            });
        }

        // Find completed chats with orders for products from this shop
        const eligibleChats = await ChatModel.find({
            buyerId: userId,
            sellerId: shop.owner,
            orderCompleted: true,
            orderId: { $exists: true }
        }).populate('orderId');

        // Check which orders don't have shop reviews yet
        const eligibleOrders = [];
        
        for (const chat of eligibleChats) {
            const existingReview = await ShopReviewModel.findOne({
                shopId: shopId,
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
            message: "Shop review eligibility checked",
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

// Update shop review (only by original reviewer)
export const updateShopReviewController = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, aspects } = req.body;
        const userId = req.userId;

        // Find the review
        const review = await ShopReviewModel.findOne({
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
        if (aspects !== undefined) {
            updateData.aspects = aspects;
        }

        const updatedReview = await ShopReviewModel.findByIdAndUpdate(
            reviewId,
            updateData,
            { new: true }
        ).populate('userId', 'name');

        // Update shop rating stats
        await updateShopRatingStats(review.shopId);

        return res.status(200).json({
            message: "Shop review updated successfully",
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

// Delete shop review (soft delete)
export const deleteShopReviewController = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.userId;

        // Find and update review
        const review = await ShopReviewModel.findOneAndUpdate(
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

        // Update shop rating stats
        await updateShopRatingStats(review.shopId);

        return res.status(200).json({
            message: "Shop review deleted successfully",
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

// Helper function to update shop rating statistics
const updateShopRatingStats = async (shopId) => {
    try {
        const stats = await ShopReviewModel.aggregate([
            {
                $match: {
                    shopId: new mongoose.Types.ObjectId(shopId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        const rating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
        const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

        await ShopModel.findByIdAndUpdate(shopId, {
            rating: rating,
            totalReviews: totalReviews
        });

    } catch (error) {
        console.error('Error updating shop rating stats:', error);
    }
};
