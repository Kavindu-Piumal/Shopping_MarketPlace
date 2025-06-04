import SubCategoryModel from '../models/subCategory.model.js';

export const AddSubCategoryController = async (req, res) => {
    try {
        const { name, image, category } = req.body;
        if (!name || !image || !category) {
            return res.status(400).json({
                message: "All fields are required",
                error: true,
                success: false
            });
        }
        const payload = {
            name,
            image,
            category,
            createdBy: req.userId // Set creator
        };

        const createsubCategory = new SubCategoryModel(payload);
        const save=await createsubCategory.save();
        if (!save) {
            return res.status(500).json({
                message: "SubCategory not created",
                error: true,
                success: false
            });
        }

        return res.status(201).json({
            message: "SubCategory created successfully",
            subCategory: save,
            error: false,
            success: true
        });

        
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const GetSubCategoryController = async (req, res) => {
    try {
        // Show all subcategories to all users (like categories)
        // Edit/delete permissions are handled in respective controllers
        const subCategory = await SubCategoryModel.find({}).populate("category").sort({ createdAt: -1 });
        
        return res.status(200).json({
            message: "SubCategory fetched successfully",
            subCategory,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const UpdateSubCategoryController = async (req, res) => {
    try{
        const { _id,name,image,category } = req.body;
        const checkSub = await SubCategoryModel.findById(_id);
        if (!checkSub) {
            return res.status(400).json({
                message: "SubCategory not found",
                error: true,
                success: false
            });
       }
       
        // If user is admin, allow update without further checks
        const isAdmin = req.user.role === 'admin';
        
        // If not admin, check if user is the creator
        if (!isAdmin) {
            const isCreator = String(checkSub.createdBy) === req.userId;
            if (!isCreator) {
                return res.status(403).json({
                    message: "Not allowed to update this subcategory",
                    error: true,
                    success: false
                });
            }
        }
        
        const UpdateSubCategory = await SubCategoryModel.findByIdAndUpdate(_id, {
            name,
            image,
            category
        });
        return res.status(200).json({
            message: "SubCategory updated successfully",
            subCategory: UpdateSubCategory,
            error: false,
            success: true
        });

    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const DeleteSubCategoryController = async (req, res) => {
    try{
        const { _id } = req.body;
        const subCategory = await SubCategoryModel.findById(_id);
        if (!subCategory) {
            return res.status(400).json({
                message: "SubCategory not found",
                error: true,
                success: false
            });
        }
        
        // If user is admin, allow deletion without further checks
        const isAdmin = req.user.role === 'admin';
        
        // If not admin, check if user is the creator
        if (!isAdmin) {
            const isCreator = String(subCategory.createdBy) === req.userId;
            if (!isCreator) {
                return res.status(403).json({
                    message: "Not allowed to delete this subcategory",
                    error: true,
                    success: false
                });
            }
        }
        
        const deleteSub = await SubCategoryModel.findByIdAndDelete(_id);
        return res.status(200).json({
            message: "SubCategory deleted successfully",
            subCategory: deleteSub,
            error: false,
            success: true
        });
    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const GetMySubCategoriesController = async (req, res) => {
    try {
        // Show all subcategories to all users (like categories)
        // But edit/delete permissions are handled in respective controllers
        const subCategories = await SubCategoryModel.find({}).populate("category").sort({ createdAt: -1 });
        return res.status(200).json({
            message: "SubCategories fetched successfully",
            subCategories,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}