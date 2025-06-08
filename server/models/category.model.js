import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "",
    },
    slug: {
        type: String,
        required: false, // made optional
        default: "",
    },
    image:{
        type:String,
        required:true,
        default:"",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
}, { timestamps: true });

const CategoryModel = mongoose.model("category", categorySchema);
export default CategoryModel;