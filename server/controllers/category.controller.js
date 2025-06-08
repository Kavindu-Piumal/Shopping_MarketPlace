import ProductModel from '../models/product.model.js';
import CategoryModel from '../models/category.model.js';
import SubCategoryModel from '../models/subCategory.model.js';

export const addCategoryController = async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name || !image) {
      return res.status(400).json({
        message: 'Please provide all the required fields',
        error: true,
        success: false
      });
    }
    const addCategory = new CategoryModel({
      name,
      image,
      createdBy: req.userId // Set creator
    });
    const savedCategory = await addCategory.save();
    if (!savedCategory) {
      return res.status(500).json({
        message: 'Failed to save category',
        error: true,
        success: false
      });
    }
    return res.status(201).json({
      message: 'Category added successfully',
      data: savedCategory,
      error: false,
      success: true
    })
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

export  const getAllCategoriesController = async (req, res) => {
  try{
    // Always return all categories for all users
    const data = await CategoryModel.find();
    return res.status(200).json({
      message: "Categories fetched successfully",
      data,
      error: false,
      success: true
    });
  }catch(error){
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

export const updateCategoryController = async (req, res) => {
  try{
    const { _id , name , image } = req.body;
    const category = await CategoryModel.findById(_id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false
      });
    }
    
    // If user is admin, allow update without further checks
    const isAdmin = req.user.role === 'admin';
    
    // If not admin, check if user is the creator
    if (!isAdmin) {
      const isCreator = String(category.createdBy) === req.userId;
      if (!isCreator) {
        return res.status(403).json({
          message: "Not allowed to update this category",
          error: true,
          success: false
        });
      }
    }
    
    const update = await CategoryModel.updateOne({
      _id: _id
    }, {
        name,
        image
      });
      return res.status(200).json({
        message: "Category updated successfully",
        data: update,
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

export const deleteCategoryController = async (req, res) => {
  try {
    const { _id } = req.body;
    const category = await CategoryModel.findById(_id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false
      });
    }
    
    // If user is admin, allow deletion without further checks
    const isAdmin = req.user.role === 'admin';
    
    // If not admin, check if user is the creator
    if (!isAdmin) {
      const isCreator = String(category.createdBy) === req.userId;
      if (!isCreator) {
        return res.status(403).json({
          message: "Not allowed to delete this category",
          error: true,
          success: false
        });
      }
    }

    const checkSubCategory = await SubCategoryModel.find({
      category: {
        "$in": [_id]
      }
    }).countDocuments()

    const checkProduct = await ProductModel.find({
      category: {
        "$in": [_id]
      }
    }).countDocuments()

    if (checkSubCategory > 0 || checkProduct > 0) {
      return res.status(400).json({
        message: "Cannot delete category, it is being used in subcategories or products",
        error: true,
        success: false
      });
    }

    const deleteCategory = await CategoryModel.deleteOne({_id: _id});

    return res.status(200).json({
      message: "Category deleted successfully",
      data: deleteCategory,
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

export const GetMyCategoriesController = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== 'admin') {
            filter = { createdBy: req.userId };
        }
        const categories = await CategoryModel.find(filter).sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Categories fetched successfully",
            categories,
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
