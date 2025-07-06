import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import ChatModel from '../models/chat.model.js';
import { 
    newOrderSellerTemplate, 
    orderConfirmationBuyerTemplate, 
    orderStatusUpdateTemplate 
} from './orderNotificationTemplates.js';

// Get website URL from environment or use default
const getWebsiteUrl = () => {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Generate chat link for direct communication
const generateChatLink = (orderId, buyerId, sellerId) => {
    const websiteUrl = getWebsiteUrl();
    return `${websiteUrl}/chat?orderId=${orderId}&with=${buyerId}&sellerId=${sellerId}`;
};

// Send notification to seller when new order is placed
export const notifySellerNewOrder = async (orderData) => {
    try {
        // Get seller details
        const product = await ProductModel.findById(orderData.productId).populate('sellerId');
        if (!product || !product.sellerId) {
            console.error('Product or seller not found for order:', orderData.orderId);
            return false;
        }

        // Get buyer details
        const buyer = await UserModel.findById(orderData.userId);
        if (!buyer) {
            console.error('Buyer not found for order:', orderData.orderId);
            return false;
        }

        const seller = product.sellerId;
        
        // Generate chat link
        const chatLink = generateChatLink(orderData._id, orderData.userId, seller._id);
        
        // Prepare email data
        const emailData = {
            sendTo: seller.email,
            subject: `🎉 New Order Received - ${product.name}`,
            html: newOrderSellerTemplate({
                sellerName: seller.name,
                buyerName: buyer.name,
                orderDetails: {
                    orderId: orderData.orderId,
                    productName: product.name,
                    totalAmount: orderData.totalAmt,
                    paymentMethod: orderData.payment_status
                },
                chatLink: chatLink,
                websiteUrl: getWebsiteUrl()
            })
        };

        // Send email
        const result = await sendEmail(emailData);
        
        if (result) {
            console.log(`New order notification sent to seller: ${seller.email}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error sending new order notification to seller:', error);
        return false;
    }
};

// Send confirmation notification to buyer when seller confirms order
export const notifyBuyerOrderConfirmed = async (orderData) => {
    try {
        // Get buyer details
        const buyer = await UserModel.findById(orderData.userId);
        if (!buyer) {
            console.error('Buyer not found for order:', orderData.orderId);
            return false;
        }

        // Get product and seller details
        const product = await ProductModel.findById(orderData.productId).populate('sellerId');
        if (!product || !product.sellerId) {
            console.error('Product or seller not found for order:', orderData.orderId);
            return false;
        }

        const seller = product.sellerId;
        
        // Generate chat link
        const chatLink = generateChatLink(orderData._id, orderData.userId, seller._id);
        
        // Prepare email data
        const emailData = {
            sendTo: buyer.email,
            subject: `✅ Order Confirmed - ${product.name}`,
            html: orderConfirmationBuyerTemplate({
                buyerName: buyer.name,
                sellerName: seller.name,
                orderDetails: {
                    orderId: orderData.orderId,
                    productName: product.name,
                    totalAmount: orderData.totalAmt,
                    paymentMethod: orderData.payment_status
                },
                chatLink: chatLink,
                websiteUrl: getWebsiteUrl()
            })
        };

        // Send email
        const result = await sendEmail(emailData);
        
        if (result) {
            console.log(`Order confirmation notification sent to buyer: ${buyer.email}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error sending order confirmation notification to buyer:', error);
        return false;
    }
};

// Send order status update notification
export const notifyOrderStatusUpdate = async (orderData, newStatus) => {
    try {
        // Get buyer details
        const buyer = await UserModel.findById(orderData.userId);
        if (!buyer) {
            console.error('Buyer not found for order:', orderData.orderId);
            return false;
        }

        // Get product details
        const product = await ProductModel.findById(orderData.productId);
        if (!product) {
            console.error('Product not found for order:', orderData.orderId);
            return false;
        }
        
        // Prepare email data
        const emailData = {
            sendTo: buyer.email,
            subject: `📋 Order Status Update - ${product.name}`,
            html: orderStatusUpdateTemplate({
                buyerName: buyer.name,
                orderDetails: {
                    orderId: orderData.orderId,
                    productName: product.name
                },
                newStatus: newStatus,
                websiteUrl: getWebsiteUrl()
            })
        };

        // Send email
        const result = await sendEmail(emailData);
        
        if (result) {
            console.log(`Order status update notification sent to buyer: ${buyer.email}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error sending order status update notification:', error);
        return false;
    }
};

// Utility function to send all relevant notifications for a new order
export const handleNewOrderNotifications = async (orders) => {
    const results = [];
    
    for (const order of orders) {
        try {
            // Send notification to seller
            const sellerNotified = await notifySellerNewOrder(order);
            results.push({
                orderId: order.orderId,
                sellerNotified: sellerNotified,
                buyerNotified: false // Buyer gets notified when seller confirms
            });
            
            // Update order with notification status
            order.seller_notified = sellerNotified;
            await order.save();
            
        } catch (error) {
            console.error(`Error handling notifications for order ${order.orderId}:`, error);
            results.push({
                orderId: order.orderId,
                sellerNotified: false,
                buyerNotified: false,
                error: error.message
            });
        }
    }
    
    return results;
};
