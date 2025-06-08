import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar:{
        type: String,
        default: "",
    },
    mobile: {
        type: Number,
        default: null,
    },
    refreshToken: {
        type: String,
        default: "",
    },
    verify_email: {
        type: Boolean,
        default: false,
    },
    last_login_date: {
        type: Date,
        default: "",
    },
    status: {
        type: String,
        enum: ["active", "inactive","Suspended"],
        default: "active",
    },
    address_details:[ {
        type: mongoose.Schema.ObjectId,
        ref: "address",
    }],
    shopping_cart:[ {
        type: mongoose.Schema.ObjectId,
        ref: "cartProduct",
    }],
    order_history:[ {
        type: mongoose.Schema.ObjectId,
        ref: "order",
    }],
    forgot_password_otp: {
        type: String,
        default: null,
    },
    forgot_password_expiry: {
        type: Date,
        default: "",
    },
    role: {
        type: String,
        enum: ["user", "admin", "seller"],
        default: "user",
    },




}, { timestamps: true });

const UserModel=mongoose.model("user", userSchema);

export default UserModel;