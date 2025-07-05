import mongoose from "mongoose";

const reviewEligibilitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product",
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
    orderCompletedAt: {
        type: Date,
        required: true
    },
    hasReviewed: {
        type: Boolean,
        default: false
    },
    reviewId: {
        type: mongoose.Schema.ObjectId,
        ref: "review",
        required: false
    },
    reviewPromptShown: {
        type: Boolean,
        default: false
    },
    reviewPromptShownAt: {
        type: Date,
        required: false
    },
    reviewDeclined: {
        type: Boolean,
        default: false
    },
    reviewDeclinedAt: {
        type: Date,
        required: false
    }
}, { timestamps: true });

// Compound index to ensure one eligibility record per user per product per order
reviewEligibilitySchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

// Index for fast user review eligibility lookups
reviewEligibilitySchema.index({ userId: 1, hasReviewed: 1 });

// Index for product review eligibility lookups
reviewEligibilitySchema.index({ productId: 1, hasReviewed: 1 });

const ReviewEligibilityModel = mongoose.model("reviewEligibility", reviewEligibilitySchema);
export default ReviewEligibilityModel;
