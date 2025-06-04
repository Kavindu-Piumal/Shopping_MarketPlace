import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
    },
    orderId: {  
        type: String,
        unique: true,
        required: true,
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product",
    },
    product_details: {
        name: String,
        image: Array,

    },
    shippingAddress: {
        type: mongoose.Schema.ObjectId,
        ref: "address",
        required: true,
    },
    paymentId: {
        type: String,
        required: true,
        default: "COD",
    },
    payment_status: {
            type: String,
            default: "",
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: "address",
    },
    subTotalAmt:{
        type: Number,
        default: 0,
    },
    totalAmt:{
        type: Number,
        default: 0,
    },
    invoice_receipt: {
        type: String,
        default: "",
    },
    
        
    
   
}, { timestamps: true });

const OrderModel = mongoose.model("order", orderSchema);
export default OrderModel;