import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product",
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
        required: false  // Changed from true to false to make it optional
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
    isVerifiedPurchase: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index to ensure one review per user per product per order
reviewSchema.index({ productId: 1, userId: 1, orderId: 1 }, { unique: true });

// Index for fast product review lookups
reviewSchema.index({ productId: 1, isActive: 1 });

const ReviewModel = mongoose.model("review", reviewSchema);
export default ReviewModel;
