import ProductModel from "../models/product.model.js";
import ShopModel from "../models/shop.model.js";
import { reactivateShop } from "../utils/shopDormancySystem.js";

export const createProductController=async(req,res)=>{
    try{
        const { name,
                image,
                category,
                subCategory,
                unit,
                stock,
                price,
                discount,
                description,
                more_details} = req.body;

                if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description ) {
                    return res.status(400).json({
                        message: "All fields are required",
                        error: true,
                        success: false
                    });
                }

                const product= new ProductModel({
                    name,
                    image,
                    category,
                    subCategory,
                    unit,
                    stock,
                    price,
                    discount,
                    description,
                    more_details,
                    sellerId: req.userId // Set seller
                });                const  saveProduct=await product.save();

                // Reactivate shop if it's dormant/inactive when seller adds new product
                try {
                    const shop = await ShopModel.findOne({ owner: req.userId });
                    if (shop && ['dormant', 'inactive'].includes(shop.status)) {
                        await reactivateShop(shop._id);
                        console.log(`🔄 Shop reactivated due to new product: ${shop.name}`);
                    }
                } catch (reactivateError) {
                    console.error('Error reactivating shop:', reactivateError);
                    // Don't fail product creation if reactivation fails
                }

                return res.status(201).json({
                    message: "Product created successfully",
                    data: saveProduct,
                    error: false,
                    success: true
                });

    }catch(error){
        res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }}

export const getProductController=async(req,res)=>{
    try{
        let {page,limit,search}=req.body;
        if(!page){
            page=1;
        }

        if(!limit){
            limit=10;
        }

        const skip=(page-1)*limit;

        let query = search ? {
            $text:{
                $search:search,
                $caseSensitive:false,
                $diacriticSensitive:false
            }

        } : {};

        // Only show own products for sellers
        if (req.user && req.user.role !== 'admin') {
            query = { ...query, sellerId: req.userId };
        }

        const [data,totalCount]=await Promise.all([
            ProductModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit).populate("category subCategory"),
            ProductModel.countDocuments(query)      
        ])

        return res.status(200).json({
            message:"Product fetched successfully",
            data:data,
            totalCount:totalCount,
            error:false,
            success:true,
            totalNoPages:Math.ceil(totalCount/limit),
        })


    }catch(error){
        res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }}

export const getProductbyCategoryController=async(req,res)=>{
    try{
        const {id}=req.body;
        if(!id){
            return res.status(400).json({
                message:"Category id is required",
                error:true,
                success:false
            })
        }
          // Build query to exclude seller's own products from general listings
        const query = {
            category:{$in:id}
        };
        
        // If user is logged in and is a seller, exclude their own products from general views
        if (req.userId && req.user && req.user.role === 'seller') {
            query.sellerId = { $ne: req.userId };
            console.log(`🚫 Filtering out products for seller ${req.userId} in category ${id}`);
        } else {
            console.log(`👀 Public category view for category ${id} - no filtering applied`);
        }
        
        console.log('Final query:', JSON.stringify(query));
        const product=await ProductModel.find(query).limit(10);

        return res.status(200).json({
            message:"Product fetched successfully",
            data:product,
            error:false,
            success:true
        })

        


    }catch(error){
        res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export const getProductbucategoryandsubcategoryController = async(req,res)=>{
    try{
        const {categoryId, subCategoryId,page,limit} = req.body;
        if(!categoryId || !subCategoryId){
            return res.status(400).json({
                message:"Category id and SubCategory id is required",
                error:true,
                success:false
            })
        }

        if(!page){
            page=1;
        }

        if(!limit){
            limit=10;
        }

        const skip=(page-1)*limit;        const query={
            category:{$in:categoryId},
            subCategory:{$in:subCategoryId}
        }
        
        // If user is logged in and is a seller, exclude their own products from general views
        if (req.userId && req.user && req.user.role === 'seller') {
            query.sellerId = { $ne: req.userId };
        }

        const[data,datacount]= await Promise.all([
            ProductModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit),
            ProductModel.countDocuments(query)
        ])

        return res.status(200).json({
            message:"Product fetched successfully",
            data:data,
            totalCount:datacount,
            error:false,
            success:true,
            page:page,
            limit:limit
        })


    } catch(error){
        res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export const getProductbyController=async(req,res)=>{

    try{

        const {productId}=req.body;
        const product=await ProductModel.findOne({_id:productId})

        return res.status(200).json({
            message:"Product fetched successfully",
            data:product,
            error:false,
            success:true
        })

    }catch(error){
        res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }}

export const updateProductDetailsController=async(req,res)=>{
    try{
        const{_id} = req.body;
        if(!_id){
            return res.status(400).json({
                message:"Product id is required",
                error:true,
                success:false
            })
        }

        // Check if product exists
        const product = await ProductModel.findById(_id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        // Check authorization - admin can update any product, sellers can only update their own
        const isAdmin = req.user.role === "admin";
        const isCreator = product.sellerId.toString() === req.userId;
        
        if (!isAdmin && !isCreator) {
            return res.status(403).json({
                message: "You are not authorized to update this product",
                error: true,
                success: false
            });
        }

        const updateProduct= await ProductModel.updateOne(
            {_id:_id},
            {...req.body},
            
        )

        return res.status(200).json({
            message:"Product updated successfully",
            data:updateProduct,
            error:false,
            success:true
        })

    }catch(error){
        res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export const deleteProductController=async(req,res)=>{
    try{
        const {_id }=req.body;

        if(!_id){
            return res.status(400).json({
                message:"Product id is required",
                error:true,
                success:false
            })
        }

        // Check if the product exists
        const product = await ProductModel.findById(_id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        // If user is admin, allow deletion without further checks
        const isAdmin = req.user.role === "admin";
        
        // If not admin, check if user is the creator
        if (!isAdmin) {
            const isCreator = product.sellerId.toString() === req.userId;
            if (!isCreator) {
                return res.status(403).json({
                    message: "You are not authorized to delete this product",
                    error: true,
                    success: false
                });
            }
        }

        const deleteProduct=await ProductModel.deleteOne({_id:_id});

        return res.status(200).json({
            message:"Product Deleted successfully",
            data:deleteProduct,
            error:false,
            success:true
        })

    }catch(error){
        res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }

    
}

export const searchProduct = async (req, res) => {
    try{
        let { search,page,limit } = req.body;
        if (!page) {
            page = 1;
        }

        if (!limit) {
            limit = 30;
        }        const query = search
             ? {
        $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
        // add more fields if needed
        ]
         }
        : {};
          // If user is logged in and is a seller, exclude their own products from general search results
        if (req.userId && req.user && req.user.role === 'seller') {
            query.sellerId = { $ne: req.userId };
            console.log(`🚫 Filtering search results for seller ${req.userId}`);
        } else {
            console.log(`👀 Public search - no filtering applied`);
        }
        
        console.log('Search query:', JSON.stringify(query));
        
        const skip = (page - 1) * limit;

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("category subCategory"),
            ProductModel.countDocuments(query)
        ])

        return res.status(200).json({
            message: "Product fetched successfully",
            data: data,
            totalCount: dataCount,
            error: false,
            success: true,
            limit:limit,
            page: page,
            totalPages: Math.ceil(dataCount / limit),
        });
        

        

    }catch(error){
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const getMyProductsController = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== 'admin') {
            filter = { sellerId: req.userId };
        }
        const products = await ProductModel.find(filter).sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Products fetched successfully",
            data: products,
            error: false,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Hot Deals Controller - Products with high discounts
export const getHotDealsController = async (req, res) => {
    try {
        let { page, limit, minDiscount } = req.body;
        
        // Default values
        if (!page) page = 1;
        if (!limit) limit = 20;
        if (!minDiscount) minDiscount = 30; // Default minimum discount percentage
        
        const skip = (page - 1) * limit;
        
        // Find products with discount >= minDiscount and stock > 0
        const query = {
            discount: { $gte: minDiscount },
            stock: { $gt: 0 }
        };
        
        // 🎯 SELLER EXPERIENCE: Exclude seller's own products from hot deals
        if (req.userId && req.user && req.user.role === 'seller') {
            query.sellerId = { $ne: req.userId };
            console.log(`🚫 Filtering out hot deals for seller ${req.userId} with min discount ${minDiscount}%`);
        } else {
            console.log(`👀 Public hot deals view with min discount ${minDiscount}% - no filtering applied`);
        }
        
        const [data, totalCount] = await Promise.all([
            ProductModel.find(query)
                .sort({ discount: -1, createdAt: -1 }) // Sort by highest discount first, then newest
                .skip(skip)
                .limit(limit)
                .populate("category subCategory"),
            ProductModel.countDocuments(query)
        ]);
        
        const totalPage = Math.ceil(totalCount / limit);
        
        return res.status(200).json({
            message: "Hot deals fetched successfully",
            data: data,
            totalPage: totalPage,
            page: page,
            limit: limit,
            totalCount: totalCount,
            error: false,
            success: true
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}