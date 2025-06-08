import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'GET /api/chat/admin/history',
            'GET /api/chat/admin/chat-detail',
            'POST /api/chat/admin/decrypt-message',
            'GET /api/chat/admin/user-chats'
        ]
    },
    resource: {
        type: String,
        required: true,
        enum: ['chat_history', 'chat_detail', 'message_decrypt', 'user_chats']
    },
    targetUserId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        default: null
    },
    chatId: {
        type: mongoose.Schema.ObjectId,
        ref: "chat",
        default: null
    },
    justification: {
        type: String,
        required: false
    },
    details: {
        searchTerm: String,
        filterStatus: String,
        ipAddress: String,
        userAgent: String,
        messageCount: Number
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for efficient querying
auditSchema.index({ adminId: 1, timestamp: -1 });
auditSchema.index({ action: 1, timestamp: -1 });
auditSchema.index({ targetUserId: 1, timestamp: -1 });

const AuditModel = mongoose.model("admin_audit", auditSchema);
export default AuditModel;
