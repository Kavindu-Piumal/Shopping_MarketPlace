import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "",
    },
    image:{
        type:String,
        required:true,
        default:"",
    },
    category:[{
        type: mongoose.Schema.ObjectId,
        ref: "category",
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
}, { timestamps: true });

const SubCategoryModel = mongoose.model("subCategory", subCategorySchema);
export default SubCategoryModel;