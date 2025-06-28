import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['order_placed', 'order_confirmed', 'order_shipped', 'order_delivered', 'message_received', 'payment_received', 'review_received', 'shop_approved'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }
  },
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String // URL to navigate when notification is clicked
  },
  icon: {
    type: String,
    default: 'bell'
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
