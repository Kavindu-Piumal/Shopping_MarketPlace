import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address_line: {
        type: String,
        required: true,
        default: "",
    },
    city: {
        type: String,
        required: true,
        default: "",
    },
    state: {
        type: String,
        required: true,
        default: "",
    },
    pincode: {
        type: String,
        required: true,
        default: "",
    },
    country: {
        type: String,
        required: true,
        default: "",
    },
    mobile: {
        type: Number,
        required: true,
        default: "",
    },
    status: {
        type: Boolean,
        default: true,
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        default:"",

    }
    
},{timestamps: true});

const AddressModel = mongoose.model("address", addressSchema);
export default AddressModel;
