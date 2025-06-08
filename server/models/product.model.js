import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "",
    },
    description: {
        type: String,
        required: true,
        default: "",
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    category: [{
        type: mongoose.Schema.ObjectId,
        ref: "category",
    }],
    subCategory: [{ // FIX: use subCategory (capital C) everywhere
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
    }],
    unit:{
        type: String,
        required: true,
        default: "",
    },
    stock:{
        type: Number,
        required: true,
        default: 0,
    },
    discount:{
        type: Number,
        required: true,
        default: 0,
    },
    more_details: {
        type: Object, // Accepts plain JS objects
        required: false,
        default: {}
    },
    public:{
        type: Boolean,
        required: true,
        default: false,
    },

    image:{
        type:Array,
        required:true,
        default:[],
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
}, { timestamps: true });

productSchema.index({ name: "text", description: "text" }); // Create a text index on the name and description fields


const ProductModel = mongoose.model("product", productSchema);
export default ProductModel;


