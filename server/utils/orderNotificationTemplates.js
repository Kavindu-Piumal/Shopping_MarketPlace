// Email templates for order notifications

// Template for notifying seller about new order
const newOrderSellerTemplate = ({ sellerName, buyerName, orderDetails, chatLink, websiteUrl }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Received</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fdfb; padding: 20px; border: 1px solid #d1fae5; }
            .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 5px; }
            .btn:hover { background: #059669; }
            .eco-badge { background: #ecfdf5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🎉 New Order Received!</h2>
                <div class="eco-badge">♻️ Sustainable Marketplace</div>
            </div>
            
            <div class="content">
                <p><strong>Hello ${sellerName},</strong></p>
                
                <p>Great news! You have received a new order on our sustainable marketplace.</p>
                
                <div class="order-details">
                    <h3>📦 Order Details:</h3>
                    <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                    <p><strong>Product:</strong> ${orderDetails.productName}</p>
                    <p><strong>Buyer:</strong> ${buyerName}</p>
                    <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
                    <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
                    <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p>💬 <strong>You can directly communicate with the buyer by clicking the chat button below:</strong></p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${chatLink}" class="btn">💬 Chat with Buyer</a>
                    <a href="${websiteUrl}/orders" class="btn">📋 View All Orders</a>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>🔍 Review the order details</li>
                    <li>💬 Contact the buyer if needed</li>
                    <li>✅ Confirm the order to proceed</li>
                    <li>📦 Prepare the item for shipping</li>
                </ol>
                
                <p>Remember to confirm this order to notify the buyer and proceed with fulfillment.</p>
            </div>
            
            <div class="footer">
                <p>🌱 Thank you for being part of our sustainable marketplace!</p>
                <p>Together, we're making a difference for our planet. 🌍</p>
                <p><a href="${websiteUrl}">Visit Sustainable Marketplace</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Template for notifying buyer about order confirmation
const orderConfirmationBuyerTemplate = ({ buyerName, sellerName, orderDetails, chatLink, websiteUrl }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmed</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fdfb; padding: 20px; border: 1px solid #d1fae5; }
            .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 5px; }
            .btn:hover { background: #059669; }
            .eco-badge { background: #ecfdf5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 8px 8px; }
            .status-confirmed { background: #ecfdf5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>✅ Order Confirmed!</h2>
                <div class="eco-badge">♻️ Sustainable Shopping</div>
            </div>
            
            <div class="content">
                <p><strong>Hello ${buyerName},</strong></p>
                
                <p>Excellent! Your order has been confirmed by the seller and is now being prepared for shipment.</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <span class="status-confirmed">🎉 Order Confirmed</span>
                </div>
                
                <div class="order-details">
                    <h3>📦 Order Details:</h3>
                    <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                    <p><strong>Product:</strong> ${orderDetails.productName}</p>
                    <p><strong>Seller:</strong> ${sellerName}</p>
                    <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
                    <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
                    <p><strong>Confirmation Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p>🚚 <strong>What happens next?</strong></p>
                <ol>
                    <li>📦 Your order is being prepared by the seller</li>
                    <li>🚛 You'll receive tracking information once shipped</li>
                    <li>📧 We'll notify you of any updates</li>
                    <li>🏠 Your eco-friendly product will be delivered soon!</li>
                </ol>
                
                <p>💬 <strong>Need to contact the seller?</strong></p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${chatLink}" class="btn">💬 Chat with Seller</a>
                    <a href="${websiteUrl}/my-orders" class="btn">📋 Track Order</a>
                </div>
                
                <p>Thank you for choosing sustainable shopping! 🌱</p>
            </div>
            
            <div class="footer">
                <p>🌍 Every purchase makes a difference for our planet!</p>
                <p>Keep shopping sustainably and help reduce waste. ♻️</p>
                <p><a href="${websiteUrl}">Continue Shopping</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Template for order status update notifications
const orderStatusUpdateTemplate = ({ buyerName, orderDetails, newStatus, websiteUrl }) => {
    const statusEmojis = {
        pending: "⏳",
        confirmed: "✅", 
        shipped: "🚛",
        delivered: "📦",
        cancelled: "❌"
    };

    const statusMessages = {
        pending: "Your order is pending confirmation",
        confirmed: "Your order has been confirmed and is being prepared",
        shipped: "Your order has been shipped and is on its way",
        delivered: "Your order has been delivered successfully",
        cancelled: "Your order has been cancelled"
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Order Status Update</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fdfb; padding: 20px; border: 1px solid #d1fae5; }
            .status-update { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; border-left: 4px solid #10b981; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 5px; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>${statusEmojis[newStatus]} Order Status Update</h2>
            </div>
            
            <div class="content">
                <p><strong>Hello ${buyerName},</strong></p>
                
                <div class="status-update">
                    <h3>${statusEmojis[newStatus]} ${statusMessages[newStatus]}</h3>
                    <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                    <p><strong>Product:</strong> ${orderDetails.productName}</p>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${websiteUrl}/my-orders" class="btn">📋 View Order Details</a>
                </div>
            </div>
            
            <div class="footer">
                <p>🌱 Thank you for sustainable shopping!</p>
                <p><a href="${websiteUrl}">Visit Sustainable Marketplace</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export {
    newOrderSellerTemplate,
    orderConfirmationBuyerTemplate,
    orderStatusUpdateTemplate
};
