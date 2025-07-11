import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import crypto from "crypto";
import { createMessageNotification } from "./notification.controller.js";

// Encryption key for chat messages (store in environment variable in production)
const ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY 
    ? Buffer.from(process.env.CHAT_ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0'), 'utf8')
    : crypto.randomBytes(32);
const IV_LENGTH = 16; // For AES, this is always 16

// Encrypt message content
function encryptMessage(text) {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return text; // Return original text if encryption fails
    }
}

// Decrypt message content
function decryptMessage(encryptedText) {
    try {
        const textParts = encryptedText.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedData = textParts.join(':');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedText; // Return original if decryption fails
    }
}

// Create a new chat when an order is placed
export const createChatController = async (req, res) => {
    try {
        const { orderId } = req.body;
        const buyerId = req.userId;

        // Get order details to find seller
        const order = await OrderModel.findById(orderId).populate('productId');
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Get product to find seller
        const product = await ProductModel.findById(order.productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        // Check if chat already exists
        const existingChat = await ChatModel.findOne({
            orderId: orderId,
            buyerId: buyerId,
            sellerId: product.sellerId
        });

        if (existingChat) {
            return res.status(200).json({
                message: "Chat already exists",
                data: existingChat,
                error: false,
                success: true
            });
        }

        // Create new chat
        const newChat = new ChatModel({
            orderId: orderId,
            buyerId: buyerId,
            sellerId: product.sellerId,
            productId: order.productId
        });

        const savedChat = await newChat.save();

        return res.status(201).json({
            message: "Chat created successfully",
            data: savedChat,
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

// Get all chats for a user
export const getUserChatsController = async (req, res) => {
    try {
        const userId = req.userId;

        const chats = await ChatModel.find({
            $and: [
                {
                    $or: [
                        { buyerId: userId },
                        { sellerId: userId }
                    ]
                },
                {
                    $or: [
                        { 
                            buyerId: userId,
                            $or: [
                                { deletedByBuyer: { $exists: false } },
                                { deletedByBuyer: false }
                            ]
                        },
                        { 
                            sellerId: userId,
                            $or: [
                                { deletedBySeller: { $exists: false } },
                                { deletedBySeller: false }
                            ]
                        },
                        {
                            buyerId: { $ne: userId },
                            sellerId: { $ne: userId }
                        }
                    ]                },
                {
                    $or: [
                        { isActive: true },
                        { orderCompleted: true }
                    ]
                }
            ]
        })
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email')
        .populate('productId', 'name image')
        .populate('orderId', 'orderId')
        .sort({ updatedAt: -1 });

        return res.status(200).json({
            message: "Chats fetched successfully",
            data: chats,
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

// Send a message
export const sendMessageController = async (req, res) => {
    try {
        const { chatId, receiverId, content, messageType = "text" } = req.body;
        const senderId = req.userId;

        console.log(`💬 sendMessage - senderId: ${senderId}, receiverId: ${receiverId}, chatId: ${chatId}`);

        // Verify chat exists and user is part of it
        const chat = await ChatModel.findOne({
            _id: chatId,
            $or: [
                { buyerId: senderId },
                { sellerId: senderId }
            ],
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found or access denied",
                error: true,
                success: false
            });
        }

        console.log(`💬 Chat found - buyerId: ${chat.buyerId}, sellerId: ${chat.sellerId}`);

        // Create new message with encrypted content
        const newMessage = new MessageModel({
            chatId: chatId,
            senderId: senderId,
            receiverId: receiverId,
            content: encryptMessage(content),
            messageType: messageType
        });

        const savedMessage = await newMessage.save();

        // Update chat's updatedAt
        await ChatModel.findByIdAndUpdate(chatId, { updatedAt: new Date() });

        const populatedMessage = await MessageModel.findById(savedMessage._id)
            .populate('senderId', 'name')
            .populate('receiverId', 'name');

        // Decrypt message content before sending to frontend
        const decryptedMessage = {
            ...populatedMessage.toObject(),
            content: decryptMessage(populatedMessage.content)
        };

        // Emit message via socket for real-time delivery
        if (req.io) {
            req.io.to(`chat-${chatId}`).emit('new-message', decryptedMessage);
            req.io.to(receiverId.toString()).emit('new-message', decryptedMessage); // Also emit to receiver's user room for notifications
        }

        // Create message notification for the receiver
        try {
            console.log(`📨 Creating notification for receiverId: ${receiverId} from senderId: ${senderId}`);
            await createMessageNotification(chatId, content, senderId, receiverId, req.io);
            console.log(`✅ Created message notification for user ${receiverId}`);
        } catch (error) {
            console.error('💥 Error creating message notification:', error);
        }

        return res.status(201).json({
            message: "Message sent successfully",
            data: decryptedMessage,
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

// Get messages for a chat
export const getChatMessagesController = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;
        const { page = 1, limit = 50 } = req.query;

        // Verify user is part of the chat
        const chat = await ChatModel.findOne({
            _id: chatId,
            $or: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found or access denied",
                error: true,
                success: false
            });
        }

        const skip = (page - 1) * limit;

        const messages = await MessageModel.find({ chatId: chatId })
            .populate('senderId', 'name')
            .populate('receiverId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Mark messages as read for the current user
        await MessageModel.updateMany(
            {
                chatId: chatId,
                receiverId: userId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }        );

        // Decrypt messages for display
        const decryptedMessages = messages.map(msg => ({
            ...msg.toObject(),
            content: decryptMessage(msg.content)
        }));

        return res.status(200).json({
            message: "Messages fetched successfully",
            data: decryptedMessages.reverse(), // Reverse to show oldest first
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

// Complete order and end chat
export const completeOrderController = async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.userId;

        // Verify chat exists and user is the buyer
        const chat = await ChatModel.findOne({
            _id: chatId,
            buyerId: userId,
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found or you don't have permission to complete this order",
                error: true,
                success: false
            });
        }        // Update chat as completed
        const updatedChat = await ChatModel.findByIdAndUpdate(
            chatId,
            {
                orderCompleted: true,
                completedAt: new Date(),
                isActive: false
            },
            { new: true }
        );

        // Emit real-time order completion update
        if (req.io) {
            req.io.to(`chat-${chatId}`).emit('order-status-update', {
                chatId: chatId,
                orderConfirmed: true,
                orderCompleted: true,
                completedAt: new Date(),
                message: 'Order completed by buyer'
            });
        }

        return res.status(200).json({
            message: "Order completed successfully",
            data: updatedChat,
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

// Delete chat (soft delete - available to both buyer and seller)
export const deleteChatController = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        // Verify user is part of this chat
        const chat = await ChatModel.findOne({
            _id: chatId,
            $or: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found or access denied",
                error: true,
                success: false
            });
        }

        // Determine if the user is a buyer or seller
        const isBuyer = chat.buyerId.toString() === userId.toString();
        const isSeller = chat.sellerId.toString() === userId.toString();

        // Update the appropriate deletion field
        const updateObj = {};

        if (isBuyer) {
            updateObj.deletedByBuyer = true;
            updateObj.deletedByBuyerAt = new Date();
        } else if (isSeller) {
            updateObj.deletedBySeller = true;
            updateObj.deletedBySellerAt = new Date();
        }

        await ChatModel.findByIdAndUpdate(chatId, updateObj);        // If both parties deleted, mark chat as inactive
        const updatedChat = await ChatModel.findById(chatId);
        if (updatedChat.deletedByBuyer && updatedChat.deletedBySeller) {
            await ChatModel.findByIdAndUpdate(chatId, {
                isActive: false
            });
        }

        // Emit chat deletion update
        if (req.io) {
            req.io.to(`chat-${chatId}`).emit('chat-update', {
                action: 'delete',
                chatId: chatId,
                deletedBy: userId,
                chat: updatedChat
            });
        }

        return res.status(200).json({
            message: "Chat deleted successfully",
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

// Admin endpoint to view all chat history (encrypted view)
export const getAdminChatHistoryController = async (req, res) => {
    try {
        const userId = req.userId;

        // Get all chats with populated data
        const chats = await ChatModel.find({})
            .populate('buyerId', 'name email')
            .populate('sellerId', 'name email')
            .populate('productId', 'name image price')
            .populate('orderId', 'orderId totalAmount')
            .sort({ updatedAt: -1 });

        // For each chat, get messages and add metadata
        const chatHistory = await Promise.all(chats.map(async (chat) => {
            const messages = await MessageModel.find({ chatId: chat._id })
                .populate('senderId', 'name email')
                .sort({ createdAt: 1 });

            // Count messages and prepare for admin view
            const messageCount = messages.length;
            const messagesWithEncryption = messages.map(msg => ({
                _id: msg._id,
                content: msg.content, // This is encrypted
                messageType: msg.messageType,
                senderId: msg.senderId,
                createdAt: msg.createdAt,
                // For admin, provide both views
                encryptedContent: msg.content,
                decryptedContent: decryptMessage(msg.content)
            }));

            return {
                ...chat.toObject(),
                messageCount,
                messages: messagesWithEncryption
            };
        }));

        return res.status(200).json({
            message: "Admin chat history fetched successfully",
            data: chatHistory,
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

// Confirm order by seller (new functionality)
export const confirmOrderController = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        // Verify user is seller in this chat
        const chat = await ChatModel.findOne({
            _id: chatId,
            sellerId: userId
        }).populate('orderId').populate('productId').populate('buyerId', 'name email');

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found or you're not authorized to confirm this order",
                error: true,
                success: false
            });
        }

        // Update order status
        await OrderModel.findByIdAndUpdate(chat.orderId._id, {
            payment_status: "Confirmed by Seller",
            order_status: "confirmed"
        });

        // Update chat status
        await ChatModel.findByIdAndUpdate(chatId, {
            orderConfirmed: true,
            orderConfirmedAt: new Date()
        });

        // Send system message about order confirmation
        const systemMessage = new MessageModel({
            chatId: chatId,
            senderId: userId,
            receiverId: chat.buyerId._id,
            messageType: "system",
            content: encryptMessage(`Order confirmed! Your order for ${chat.productId.name} has been confirmed by the seller.`),
            isRead: false
        });        await systemMessage.save();

        // Emit real-time order status update
        if (req.io) {
            req.io.to(`chat-${chatId}`).emit('order-status-update', {
                chatId: chatId,
                orderConfirmed: true,
                orderConfirmedAt: new Date(),
                orderCompleted: false,
                message: 'Order confirmed by seller'
            });
        }

        return res.status(200).json({
            message: "Order confirmed successfully",
            data: {
                chat: chat,
                order: chat.orderId
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

// Get full order details for seller (new functionality)
export const getOrderDetailsController = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        // Verify user is part of this chat
        const chat = await ChatModel.findOne({
            _id: chatId,
            $or: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        })
        .populate('orderId')
        .populate('productId')
        .populate('buyerId', 'name email mobile')
        .populate('sellerId', 'name email mobile');

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found or access denied",
                error: true,
                success: false
            });
        }        // Get full order details
        const orderDetails = await OrderModel.findById(chat.orderId._id)
            .populate('delivery_address')
            .populate('productId')
            .populate('userId', 'name email mobile');

        // Format the response to match frontend expectations
        const formattedOrderDetails = {
            ...orderDetails.toObject(),
            totalAmount: orderDetails.totalAmt,  // Map totalAmt to totalAmount
            productDetails: {
                name: orderDetails.product_details?.name || orderDetails.productId?.name,
                image: orderDetails.product_details?.image || orderDetails.productId?.image,
                category: orderDetails.productId?.category,
                description: orderDetails.productId?.description,
                price: orderDetails.productId?.price
            }
        };

        return res.status(200).json({
            message: "Order details fetched successfully",
            data: {
                chat: chat,
                order: formattedOrderDetails,
                canConfirm: chat.sellerId._id.toString() === userId && !chat.orderConfirmed
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

// Create a product-based chat (without order requirement)
export const createProductChatController = async (req, res) => {
    try {
        const { productId } = req.body;
        const buyerId = req.userId;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }        // Get product to find seller
        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        // Check if product has a sellerId
        if (!product.sellerId) {
            return res.status(400).json({
                message: "Product does not have a seller assigned",
                error: true,
                success: false
            });
        }

        // Check if buyer is trying to chat with themselves
        if (product.sellerId.toString() === buyerId) {
            return res.status(400).json({
                message: "You cannot chat with yourself about your own product",
                error: true,
                success: false
            });
        }

        // Check if chat already exists between buyer and seller for this product
        const existingChat = await ChatModel.findOne({
            buyerId: buyerId,
            sellerId: product.sellerId,
            productId: productId,
            orderId: { $exists: false }, // Product-only chat (no order)
            isActive: true
        });

        if (existingChat) {
            return res.status(200).json({
                message: "Chat already exists",
                data: existingChat,
                error: false,
                success: true
            });
        }        // Create new product-based chat
        const newChat = new ChatModel({
            buyerId: buyerId,
            sellerId: product.sellerId,
            productId: productId
            // orderId is not included for product-only chats
        });

        const savedChat = await newChat.save();

        // Populate the saved chat with user and product details first
        const populatedChat = await ChatModel.findById(savedChat._id)
            .populate('buyerId', 'name email')
            .populate('sellerId', 'name email')
            .populate('productId', 'name image price');

        // Send initial context message about the product
        const initialMessage = new MessageModel({
            chatId: savedChat._id,
            senderId: buyerId,
            receiverId: product.sellerId,
            messageType: "text",
            content: encryptMessage(`Hi! I'm interested in your product "${product.name}". Could you tell me more about it?`),
            isRead: false
        });

        await initialMessage.save();

        // Populate the message with sender details
        const populatedMessage = await MessageModel.findById(initialMessage._id)
            .populate('senderId', 'name avatar');

        // Decrypt message for response
        const decryptedMessage = {
            ...populatedMessage.toObject(),
            content: decryptMessage(populatedMessage.content)
        };

        // Update chat's last message
        populatedChat.lastMessage = initialMessage._id;
        populatedChat.lastMessageTime = new Date();
        await populatedChat.save();

        // Create notification for seller (NOT for sender)
        try {
            await createMessageNotification(
                product.sellerId, // receiver
                buyerId, // sender
                initialMessage._id,
                populatedChat._id,
                `Hi! I'm interested in your product "${product.name}". Could you tell me more about it?`
            );
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        // Emit real-time events using req.io if available
        if (req.io) {
            // Emit to seller only (not to sender to avoid duplicate)
            req.io.to(product.sellerId.toString()).emit('new-message', {
                chatId: savedChat._id,
                message: decryptedMessage,
                senderId: buyerId
            });

            // Emit conversation update to both users
            req.io.to(buyerId.toString()).emit('conversation-updated', {
                chatId: savedChat._id,
                conversation: populatedChat
            });

            req.io.to(product.sellerId.toString()).emit('conversation-updated', {
                chatId: savedChat._id,
                conversation: populatedChat
            });
        }

        return res.status(201).json({
            message: "Product chat created successfully",
            data: populatedChat,
            initialMessage: decryptedMessage,
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
