import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.ObjectId,
        ref: "order",
        required: false  // Made optional for product-only chats
    },
    buyerId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },
    sellerId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product",
        required: true
    },    isActive: {
        type: Boolean,
        default: true
    },
    orderCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    orderConfirmed: {
        type: Boolean,
        default: false
    },
    orderConfirmedAt: {
        type: Date,
        default: null
    },
    deletedByBuyer: {
        type: Boolean,
        default: false
    },
    deletedByBuyerAt: {
        type: Date,
        default: null
    },
    deletedBySeller: {
        type: Boolean,
        default: false
    },
    deletedBySellerAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const ChatModel = mongoose.model("chat", chatSchema);
export default ChatModel;
