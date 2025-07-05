import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ChatModel from "../models/chat.model.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";
import { handleNewOrderNotifications, notifyBuyerOrderConfirmed, notifyOrderStatusUpdate } from "../utils/orderNotifications.js";
import { createOrderNotification } from "./notification.controller.js";

export async function CashOnDeliveryController(req,res){
    try{        const userId = req.userId; // Assuming user ID is stored in req.user
        const {list_items, totalAmt, subTotalAmt, addressId} = req.body;
        console.log("Order Controller - User ID:", userId);
        console.log("Order Controller - Number of items:", list_items?.length);// Validate that sellers cannot order their own products
        const productIds = list_items
            .filter(el => el?.productId)
            .map(el => {
                // Handle both populated productId objects and ObjectId strings
                if (typeof el.productId === 'object' && el.productId._id) {
                    return el.productId._id;
                } else if (typeof el.productId === 'string') {
                    return el.productId;
                } else {
                    return el.productId; // fallback
                }
            })
            .filter(id => id); // Remove any null/undefined values        console.log("Seller Validation - Product IDs:", productIds);
        console.log("Seller Validation - Current User:", userId);
        
        const sellerProducts = await ProductModel.find({
            _id: { $in: productIds },
            sellerId: userId
        });
        
        if (sellerProducts.length > 0) {
            const sellerProductNames = sellerProducts.map(p => p.name).join(', ');
            console.log("🚫 VALIDATION FAILED - Own products detected:", sellerProductNames);
            return res.status(400).json({
                message: `You cannot place orders for your own products: ${sellerProductNames}`,
                error: true,
                success: false
            });
        }
        
        console.log("✅ VALIDATION PASSED - No own products found");        const payload = await Promise.all(
            list_items
                .filter(el => el?.productId) // Ensure productId exists
                .map(async (el) => {
                    // Handle both populated productId objects and ObjectId strings
                    let productId, productName, productImage, sellerId;
                    
                    if (typeof el.productId === 'object' && el.productId._id) {
                        // Populated productId object
                        productId = el.productId._id;
                        productName = el.productId.name;
                        productImage = el.productId.image;
                        sellerId = el.productId.sellerId;
                    } else {
                        // ProductId is just an ObjectId string - we need to fetch product details
                        productId = el.productId;
                        const product = await ProductModel.findById(productId);
                        if (product) {
                            productName = product.name;
                            productImage = product.image;
                            sellerId = product.sellerId;
                        } else {
                            productName = "Product Name";
                            productImage = [];
                            sellerId = null;
                        }
                    }
                    
                    return {
                        userId: userId,
                        buyerId: userId, // Add buyerId for clarity
                        sellerId: sellerId, // Add sellerId to order
                        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                        productId: productId,
                        product_details: {
                            name: productName,
                            image: productImage
                        },
                        paymentId: "COD", // Default value for Cash on Delivery
                        payment_status: "Cash on Delivery",
                        shippingAddress: addressId, // Use addressId for shippingAddress
                        delivery_address: addressId,
                        subTotalAmt: subTotalAmt,
                        totalAmt: totalAmt,
                        invoice_receipt: ""
                    };
                })
        );        const generateOrder = await OrderModel.insertMany(payload);
        console.log('✅ Orders created:', generateOrder.length);
        console.log('📝 Sample order data:', {
            orderId: generateOrder[0]?._id,
            totalAmt: generateOrder[0]?.totalAmt,
            sellerId: generateOrder[0]?.sellerId,
            buyerId: generateOrder[0]?.buyerId
        });
        const chatPromises = generateOrder.map(async (order) => {
            try {
                if (order.sellerId) {
                    // Check if chat already exists
                    const existingChat = await ChatModel.findOne({
                        orderId: order._id,
                        buyerId: userId,
                        sellerId: order.sellerId
                    });

                    if (!existingChat) {
                        // Create new chat
                        const newChat = new ChatModel({
                            orderId: order._id,
                            buyerId: userId,
                            sellerId: order.sellerId,
                            productId: order.productId
                        });
                        await newChat.save();
                        console.log(`✅ Created chat for order ${order._id}`);
                    } else {
                        console.log(`📝 Chat already exists for order ${order._id}`);
                    }
                } else {
                    console.log(`❌ No sellerId found for order ${order._id}`);
                }
            } catch (error) {
                console.error('Error creating chat for order:', order._id, error);
            }
        });        await Promise.all(chatPromises);
        
        // Get created chats for response
        const createdChats = await Promise.all(generateOrder.map(async (order) => {
            const chat = await ChatModel.findOne({
                orderId: order._id,
                buyerId: userId
            });
            return {
                orderId: order._id,
                chatId: chat ? chat._id : null,
                productId: order.productId
            };
        }));
        
        //remove from cart

        const removeCartItems=await CartProductModel.deleteMany({
            userId: userId}
        );        const updateUser = await UserModel.updateOne({_id: userId}, {
            shopping_cart: []
        });

        // Send email notifications to sellers
        console.log('Sending order notifications...');
        const notificationResults = await handleNewOrderNotifications(generateOrder);
        console.log('Notification results:', notificationResults);

        // Create in-app notifications for sellers
        const notificationPromises = generateOrder.map(async (order) => {
            try {
                await createOrderNotification(order, 'order_placed', order.sellerId, req.io);
                console.log(`Created notification for seller ${order.sellerId} for order ${order._id}`);
            } catch (error) {
                console.error('Error creating notification for order:', order._id, error);
            }
        });
        await Promise.all(notificationPromises);

        return res.status(200).json({
            message: "Order placed successfully",
            data: {
                orders: generateOrder,
                chats: createdChats,
                notifications: notificationResults
            },
            error: false,
            success: true
        });

    }catch(error){
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function GetOrderDetailsController(req, res) {
    try {
        const userId = req.userId; // Assuming user ID is stored in req user
        const orders = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate("delivery_address");

        return res.status(200).json({
            message: "Orders fetched successfully",
            data: orders,
            error: false,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// New controller for sellers to confirm orders
export async function ConfirmOrderController(req, res) {
    try {
        const { orderId } = req.params;
        const sellerId = req.userId; // Assuming seller ID is stored in req user

        // Find the order
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Verify that the seller is authorized to confirm this order
        if (order.sellerId.toString() !== sellerId) {
            return res.status(403).json({
                message: "You are not authorized to confirm this order",
                error: true,
                success: false
            });
        }

        // Update order status to confirmed
        order.order_status = "confirmed";
        order.buyer_notified = true;
        await order.save();

        // UPDATE: Also update the associated chat conversation
        const updatedChat = await ChatModel.findOneAndUpdate(
            { orderId: orderId },
            {
                orderConfirmed: true,
                orderConfirmedAt: new Date()
            },
            {
                new: true,
                populate: [
                    { path: 'buyerId', select: 'name email avatar' },
                    { path: 'sellerId', select: 'name email avatar' },
                    { path: 'productId', select: 'name image price' },
                    { path: 'orderId' }
                ]
            }
        );

        // Create in-app notification for buyer
        try {
            await createOrderNotification(order, 'order_confirmed', order.buyerId, req.io);
            console.log(`Created order confirmation notification for buyer ${order.buyerId}`);
        } catch (error) {
            console.error('Error creating order confirmation notification:', error);
        }

        // Send confirmation email to buyer
        const buyerNotified = await notifyBuyerOrderConfirmed(order);
        
        // Emit real-time update to both users in the chat
        if (req.io && updatedChat) {
            req.io.to(`chat-${updatedChat._id}`).emit('conversation-updated', {
                chatId: updatedChat._id,
                conversation: updatedChat,
                type: 'order_confirmed'
            });
        }

        return res.status(200).json({
            message: "Order confirmed successfully",
            data: {
                order: order,
                chat: updatedChat,
                buyerNotified: buyerNotified
            },
            error: false,
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Controller to update order status
export async function UpdateOrderStatusController(req, res) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const sellerId = req.userId;

        // Validate status
        const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status",
                error: true,
                success: false
            });
        }

        // Find the order
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Verify that the seller owns the product in this order
        const product = await ProductModel.findById(order.productId);
        if (!product || product.sellerId.toString() !== sellerId) {
            return res.status(403).json({
                message: "You are not authorized to update this order",
                error: true,
                success: false
            });
        }

        // Update order status
        const oldStatus = order.order_status;
        order.order_status = status;
        await order.save();

        // Send status update notification to buyer if status changed
        let buyerNotified = false;
        if (oldStatus !== status) {
            buyerNotified = await notifyOrderStatusUpdate(order, status);
            
            // If confirming order, also send confirmation email
            if (status === "confirmed" && !order.buyer_notified) {
                await notifyBuyerOrderConfirmed(order);
                order.buyer_notified = true;
                await order.save();
            }
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            data: {
                order: order,
                buyerNotified: buyerNotified
            },
            error: false,
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Controller to get orders for sellers
export async function GetSellerOrdersController(req, res) {
    try {
        const sellerId = req.userId;
        
        // Find all products by this seller
        const sellerProducts = await ProductModel.find({ sellerId: sellerId });
        const productIds = sellerProducts.map(product => product._id);
        
        // Find all orders for these products
        const orders = await OrderModel.find({ 
            productId: { $in: productIds } 
        })
        .sort({ createdAt: -1 })
        .populate("delivery_address")
        .populate("userId", "name email")
        .populate("productId", "name image");

        return res.status(200).json({
            message: "Seller orders fetched successfully",
            data: orders,
            error: false,
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Test endpoint to validate seller check logic
export async function TestSellerValidationController(req, res) {
    try {
        const userId = req.userId;
        const { productIds } = req.body;
        
        console.log("Test Validation - User ID:", userId);
        console.log("Test Validation - Product IDs:", productIds);
        
        const sellerProducts = await ProductModel.find({
            _id: { $in: productIds },
            sellerId: userId
        });
        
        const allProducts = await ProductModel.find({
            _id: { $in: productIds }
        });
        
        return res.status(200).json({
            message: "Test validation completed",
            data: {
                userId: userId,
                productIds: productIds,
                allProducts: allProducts.map(p => ({
                    id: p._id,
                    name: p.name,
                    sellerId: p.sellerId,
                    sellerIdString: p.sellerId.toString(),
                    isOwnProduct: p.sellerId.toString() === userId
                })),
                sellerProducts: sellerProducts,
                isValid: sellerProducts.length === 0
            },
            error: false,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// NEW: Controller for buyers to finalize orders (mark as received)
export async function FinalizeOrderController(req, res) {
    try {
        const { orderId } = req.params;
        const buyerId = req.userId; // Buyer ID from auth middleware

        // Find the order
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Verify that the buyer is authorized to finalize this order
        if (order.buyerId.toString() !== buyerId && order.userId.toString() !== buyerId) {
            return res.status(403).json({
                message: "You are not authorized to finalize this order",
                error: true,
                success: false
            });
        }

        // Check if order is already finalized
        if (order.order_status === "delivered") {
            return res.status(400).json({
                message: "Order is already completed",
                error: true,
                success: false
            });
        }

        // Check if order has been confirmed by seller first
        if (order.order_status !== "confirmed") {
            return res.status(400).json({
                message: "Order must be confirmed by seller before it can be finalized",
                error: true,
                success: false
            });
        }

        // Update order status to delivered/completed
        order.order_status = "delivered";
        await order.save();

        // Update the associated chat conversation
        const updatedChat = await ChatModel.findOneAndUpdate(
            { orderId: orderId },
            {
                orderCompleted: true,
                completedAt: new Date()
            },
            {
                new: true,
                populate: [
                    { path: 'buyerId', select: 'name email avatar' },
                    { path: 'sellerId', select: 'name email avatar' },
                    { path: 'productId', select: 'name image price' },
                    { path: 'orderId' }
                ]
            }
        );

        // Create in-app notification for seller
        try {
            await createOrderNotification(order, 'order_delivered', order.sellerId, req.io);
            console.log(`Created order completion notification for seller ${order.sellerId}`);
        } catch (error) {
            console.error('Error creating order completion notification:', error);
        }

        // Emit real-time update to both users in the chat
        if (req.io && updatedChat) {
            req.io.to(`chat-${updatedChat._id}`).emit('conversation-updated', {
                chatId: updatedChat._id,
                conversation: updatedChat,
                type: 'order_completed'
            });
        }

        return res.status(200).json({
            message: "Order completed successfully! You can now add a review.",
            data: {
                order: order,
                chat: updatedChat
            },
            error: false,
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
