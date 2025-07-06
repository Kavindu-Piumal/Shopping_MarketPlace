import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.ObjectId,
        ref: "chat",
        required: true
    },
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },    messageType: {
        type: String,
        enum: ["text", "image", "voice", "system"],
        default: "text"
    },
    content: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const MessageModel = mongoose.model("message", messageSchema);
export default MessageModel;
