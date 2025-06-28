import mongoose from "mongoose";

const shopReviewSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.ObjectId,
        ref: "shop",
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },
    orderId: {
        type: mongoose.Schema.ObjectId,
        ref: "order",
        required: true
    },
    chatId: {
        type: mongoose.Schema.ObjectId,
        ref: "chat",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false,
        maxLength: 500,
        default: ""
    },
    aspects: {
        communication: {
            type: Number,
            min: 1,
            max: 5
        },
        productQuality: {
            type: Number,
            min: 1,
            max: 5
        },
        shipping: {
            type: Number,
            min: 1,
            max: 5
        },
        service: {
            type: Number,
            min: 1,
            max: 5
        }
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index to ensure one review per user per shop per order
shopReviewSchema.index({ shopId: 1, userId: 1, orderId: 1 }, { unique: true });

// Index for fast shop review lookups
shopReviewSchema.index({ shopId: 1, isActive: 1 });

const ShopReviewModel = mongoose.model("shopReview", shopReviewSchema);
export default ShopReviewModel;
