import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ChatModel from "../models/chat.model.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";

export async function CashOnDeliveryController(req,res){
    try{
        const userId = req.userId; // Assuming user ID is stored in req.user
        const {list_items, totalAmt, subTotalAmt, addressId} = req.body;
        console.log("Received data:", list_items, totalAmt, subTotalAmt, addressId);

        const payload = list_items
            .filter(el => el?.productId && el.productId._id) // Ensure productId and _id are valid
            .map(el => {
                return {
                    userId: userId,
                    orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                    productId: el.productId._id,
                    product_details: {
                        name: el.productId.name,
                        image: el.productId.image
                    },
                    paymentId: "COD", // Default value for Cash on Delivery
                    payment_status: "Cash on Delivery",
                    shippingAddress: addressId, // Use addressId for shippingAddress
                    delivery_address: addressId,
                    subTotalAmt: subTotalAmt,
                    totalAmt: totalAmt,
                    invoice_receipt: ""
                };
            });        const generateOrder = await OrderModel.insertMany(payload);
        
        // Create chats for each order
        const chatPromises = generateOrder.map(async (order) => {
            try {
                // Get product to find seller
                const product = await ProductModel.findById(order.productId);
                if (product && product.sellerId) {
                    // Check if chat already exists
                    const existingChat = await ChatModel.findOne({
                        orderId: order._id,
                        buyerId: userId,
                        sellerId: product.sellerId
                    });

                    if (!existingChat) {
                        // Create new chat
                        const newChat = new ChatModel({
                            orderId: order._id,
                            buyerId: userId,
                            sellerId: product.sellerId,
                            productId: order.productId
                        });
                        await newChat.save();
                    }
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
        );

        const updateUser = await UserModel.updateOne({_id: userId}, {
            shopping_cart: []
        });

        return res.status(200).json({
            message: "Order placed successfully",
            data: {
                orders: generateOrder,
                chats: createdChats
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
        const userId = req.userId; // Assuming user ID is stored in req.user
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