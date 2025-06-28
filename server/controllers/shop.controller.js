import ShopModel from "../models/shop.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";

// Create a new shop
export const createShopController = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            category, 
            keywords, 
            mobile, 
            email, 
            address,
            socialLinks,
            operatingHours 
        } = req.body;

        const userId = req.userId;

        // Check if user already has a shop
        const existingShop = await ShopModel.findOne({ owner: userId });
        if (existingShop) {
            return res.status(400).json({
                message: "You already have a shop. You can edit your existing shop instead.",
                error: true,
                success: false
            });
        }

        // Check if shop name is already taken
        const nameExists = await ShopModel.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });
        if (nameExists) {
            return res.status(400).json({
                message: "Shop name is already taken. Please choose a different name.",
                error: true,
                success: false
            });
        }        // Create new shop
        const newShop = new ShopModel({
            name,
            description,
            category,
            keywords: keywords || [],
            owner: userId,
            mobile,
            email,
            address,
            socialLinks,
            operatingHours,
            status: 'active' // Set shop to active immediately - no admin approval needed
        });

        const savedShop = await newShop.save();

        // Update user role to seller and mobile number
        await UserModel.findByIdAndUpdate(userId, { 
            role: 'seller',
            mobile: mobile // Update mobile number in user profile
        });

        res.status(201).json({
            message: "Shop created successfully! Your account has been upgraded to seller.",
            error: false,
            success: true,
            data: savedShop
        });

    } catch (error) {
        console.error("Create shop error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Get all shops with filtering and pagination
export const getAllShopsController = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            category, 
            search, 
            sortBy = 'createdAt',
            sortOrder = 'desc',
            status
        } = req.query;

        const skip = (page - 1) * limit;

        console.log('GetAllShops request:', {
            userId: req.userId,
            userRole: req.user?.role,
            requestedStatus: status,
            isAdmin: req.user?.role === 'admin'
        });

        // Build query based on filters
        const query = {};
        
        // If admin is requesting with a specific status, use that
        if (req.userId && req.user?.role === 'admin' && status && status !== 'all') {
            query.status = status;
            console.log(`Admin filtering by status: ${status}`);
        } else if (req.userId && req.user?.role === 'admin' && (!status || status === 'all')) {
            // Admin viewing all shops, no status filter needed
            console.log('Admin viewing all shops - no status filter');
        } else {
            // For non-admins or if no specific status is requested, only show active shops
            query.status = 'active';
            console.log('Filtering to only active shops');
        }

        // Add category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Add search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { keywords: { $in: [new RegExp(search, 'i')] } }
            ];
        }        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        console.log('Final query:', query);
        console.log('Sort options:', sortOptions);

        const shops = await ShopModel.find(query)
            .populate('owner', 'name email avatar')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalShops = await ShopModel.countDocuments(query);

        res.json({
            message: "Shops retrieved successfully",
            error: false,
            success: true,
            data: {
                shops,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalShops / limit),
                    totalShops,
                    hasNextPage: page * limit < totalShops,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Get shops error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Get shop by ID with products
export const getShopByIdController = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const shop = await ShopModel.findById(shopId)
            .populate('owner', 'name email avatar');

        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                error: true,
                success: false
            });
        }

        // Get shop products with pagination
        const skip = (page - 1) * limit;
        const products = await ProductModel.find({ sellerId: shop.owner._id })
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await ProductModel.countDocuments({ sellerId: shop.owner._id });

        res.json({
            message: "Shop details retrieved successfully",
            error: false,
            success: true,
            data: {
                shop,
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalProducts / limit),
                    totalProducts,
                    hasNextPage: page * limit < totalProducts,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Get shop by ID error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Get user's own shop
export const getMyShopController = async (req, res) => {
    try {
        const userId = req.userId;

        const shop = await ShopModel.findOne({ owner: userId })
            .populate('owner', 'name email avatar');

        if (!shop) {
            return res.status(404).json({
                message: "You don't have a shop yet",
                error: true,
                success: false
            });
        }

        // Get shop products count
        const totalProducts = await ProductModel.countDocuments({ sellerId: userId });

        res.json({
            message: "Shop retrieved successfully",
            error: false,
            success: true,
            data: {
                ...shop.toObject(),
                totalProducts
            }
        });

    } catch (error) {
        console.error("Get my shop error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Update shop
export const updateShopController = async (req, res) => {
    try {
        const userId = req.userId;
        const updateData = req.body;

        // Find and update the shop
        const shop = await ShopModel.findOneAndUpdate(
            { owner: userId },
            updateData,
            { new: true, runValidators: true }
        ).populate('owner', 'name email avatar');

        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                error: true,
                success: false
            });
        }

        // If mobile number is updated, update it in user profile too
        if (updateData.mobile) {
            await UserModel.findByIdAndUpdate(userId, { mobile: updateData.mobile });
        }

        res.json({
            message: "Shop updated successfully",
            error: false,
            success: true,
            data: shop
        });

    } catch (error) {
        console.error("Update shop error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Get shop categories (for dropdown)
export const getShopCategoriesController = async (req, res) => {
    try {
        const categories = [
            "Electronics & Tech",
            "Clothing & Fashion", 
            "Home & Garden",
            "Automotive & Vehicle Parts",
            "Books & Media",
            "Sports & Recreation",
            "Health & Beauty",
            "Toys & Games",
            "Art & Crafts",
            "Kitchen & Dining",
            "Office Supplies",
            "Jewelry & Accessories",
            "Musical Instruments",
            "Pet Supplies",
            "Tools & Hardware",
            "Other"
        ];

        res.json({
            message: "Shop categories retrieved successfully",
            error: false,
            success: true,
            data: categories
        });

    } catch (error) {
        console.error("Get shop categories error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Upload shop display picture (logo or banner)
export const uploadShopImageController = async (req, res) => {
    try {
        const { imageType, imageUrl } = req.body; // imageType: 'logo' or 'banner'
        const userId = req.userId;

        if (!imageType || !imageUrl) {
            return res.status(400).json({
                message: "Image type and URL are required",
                error: true,
                success: false
            });
        }

        if (!['logo', 'banner'].includes(imageType)) {
            return res.status(400).json({
                message: "Image type must be 'logo' or 'banner'",
                error: true,
                success: false
            });
        }

        const shop = await ShopModel.findOne({ owner: userId });
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                error: true,
                success: false
            });
        }

        const updateData = {};
        updateData[imageType] = imageUrl;

        const updatedShop = await ShopModel.findByIdAndUpdate(
            shop._id,
            updateData,
            { new: true }
        ).populate('owner', 'name email avatar');

        res.json({
            message: `Shop ${imageType} uploaded successfully`,
            error: false,
            success: true,
            data: updatedShop
        });

    } catch (error) {
        console.error("Upload shop image error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Deactivate shop (hide all products from public view)
export const deactivateShopController = async (req, res) => {
    try {
        const userId = req.userId;

        const shop = await ShopModel.findOne({ owner: userId });
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                error: true,
                success: false
            });
        }

        if (shop.status === 'inactive') {
            return res.status(400).json({
                message: "Shop is already inactive",
                error: true,
                success: false
            });
        }

        // Update shop status to inactive
        const updatedShop = await ShopModel.findByIdAndUpdate(
            shop._id,
            { 
                status: 'inactive',
                dormancyReason: 'Manually deactivated by seller',
                dormancyDate: new Date()
            },
            { new: true }
        ).populate('owner', 'name email avatar');

        // Get product count for information
        const productCount = await ProductModel.countDocuments({ sellerId: userId });

        res.json({
            message: `Shop deactivated successfully. ${productCount} products are now hidden from public view.`,
            error: false,
            success: true,
            data: {
                shop: updatedShop,
                hiddenProducts: productCount
            }
        });

    } catch (error) {
        console.error("Deactivate shop error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Reactivate shop (make products visible again)
export const reactivateShopController = async (req, res) => {
    try {
        const userId = req.userId;

        const shop = await ShopModel.findOne({ owner: userId });
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                error: true,
                success: false
            });
        }

        if (shop.status === 'active') {
            return res.status(400).json({
                message: "Shop is already active",
                error: true,
                success: false
            });
        }

        if (shop.status === 'suspended') {
            return res.status(403).json({
                message: "Cannot reactivate suspended shop. Contact admin.",
                error: true,
                success: false
            });
        }

        // Update shop status to active
        const updatedShop = await ShopModel.findByIdAndUpdate(
            shop._id,
            { 
                status: 'active',
                $unset: { 
                    dormancyReason: 1,
                    dormancyDate: 1
                }
            },
            { new: true }
        ).populate('owner', 'name email avatar');

        // Get product count for information
        const productCount = await ProductModel.countDocuments({ sellerId: userId });

        res.json({
            message: `Shop reactivated successfully. ${productCount} products are now visible to buyers.`,
            error: false,
            success: true,
            data: {
                shop: updatedShop,
                visibleProducts: productCount
            }
        });

    } catch (error) {
        console.error("Reactivate shop error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Delete shop (with safeguards)
export const deleteShopController = async (req, res) => {
    try {
        const userId = req.userId;
        const { confirmPassword } = req.body;

        // Verify user password for security
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // Check password if provided (optional security step)
        if (confirmPassword) {
            const bcrypt = await import('bcryptjs');
            const isValidPassword = await bcrypt.compare(confirmPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    message: "Invalid password",
                    error: true,
                    success: false
                });
            }
        }

        const shop = await ShopModel.findOne({ owner: userId });
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                error: true,
                success: false
            });
        }

        // Check if shop has products
        const productCount = await ProductModel.countDocuments({ sellerId: userId });
        if (productCount > 0) {
            return res.status(400).json({
                message: `Cannot delete shop. You have ${productCount} products. Please delete all products first.`,
                error: true,
                success: false,
                data: {
                    productCount,
                    suggestion: "Delete all products before deleting your shop"
                }
            });
        }

        // Delete the shop
        await ShopModel.findByIdAndDelete(shop._id);

        // Convert seller role back to user/buyer
        await UserModel.findByIdAndUpdate(
            userId,
            { role: 'user' },
            { new: true }
        );

        res.json({
            message: "Shop deleted successfully. Your account has been converted to buyer status.",
            error: false,
            success: true,
            data: {
                deletedShop: shop.name,
                newRole: 'user',
                message: "You can create a new shop anytime in the future"
            }
        });

    } catch (error) {
        console.error("Delete shop error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Get shop lifecycle information and warnings
export const getShopLifecycleInfoController = async (req, res) => {
    try {
        const userId = req.userId;

        const shop = await ShopModel.findOne({ owner: userId });
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                error: true,
                success: false
            });
        }

        const now = new Date();
        const lastUpdate = new Date(shop.updatedAt);
        const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

        // Calculate lifecycle warnings
        const warnings = [];
        const info = {
            status: shop.status,
            daysSinceLastActivity: daysSinceUpdate,
            lastActivity: shop.updatedAt,
            dormancyReason: shop.dormancyReason,
            dormancyDate: shop.dormancyDate
        };

        // Add warnings based on activity
        if (daysSinceUpdate >= 25 && daysSinceUpdate < 30) {
            warnings.push({
                type: 'warning',
                level: 'medium',
                message: `Your shop will become dormant in ${30 - daysSinceUpdate} days due to inactivity. Add or update products to keep it active.`,
                action: 'Add products or update shop information'
            });
        } else if (daysSinceUpdate >= 30 && daysSinceUpdate < 55) {
            warnings.push({
                type: 'dormant',
                level: 'high',
                message: `Your shop is dormant. It will become inactive in ${60 - daysSinceUpdate} days. Your products are hidden from public view.`,
                action: 'Add new products to reactivate your shop'
            });
        } else if (daysSinceUpdate >= 55 && daysSinceUpdate < 60) {
            warnings.push({
                type: 'critical',
                level: 'critical',
                message: `URGENT: Your shop will become inactive in ${60 - daysSinceUpdate} days. All products will be hidden.`,
                action: 'Immediately add products or update shop'
            });
        } else if (daysSinceUpdate >= 60 && daysSinceUpdate < 85) {
            warnings.push({
                type: 'inactive',
                level: 'critical',
                message: `Your shop is inactive. It will be archived in ${90 - daysSinceUpdate} days.`,
                action: 'Add products to reactivate immediately'
            });
        } else if (daysSinceUpdate >= 85 && daysSinceUpdate < 90) {
            warnings.push({
                type: 'deletion',
                level: 'critical',
                message: `FINAL WARNING: Your shop will be archived in ${90 - daysSinceUpdate} days and may be deleted.`,
                action: 'Add products NOW to prevent archival'
            });
        } else if (daysSinceUpdate >= 90) {
            warnings.push({
                type: 'archived',
                level: 'critical',
                message: 'Your shop has been archived and is a candidate for deletion.',
                action: 'Contact support or add products to restore'
            });
        }

        // Lifecycle stages information
        const lifecycleStages = [
            {
                stage: 'Active',
                days: '0-29',
                description: 'Shop and products are visible to all buyers',
                status: 'healthy'
            },
            {
                stage: 'Dormant',
                days: '30-59',
                description: 'Shop hidden from public listings, products not visible',
                status: 'warning'
            },
            {
                stage: 'Inactive',
                days: '60-89',
                description: 'Shop marked inactive, requires immediate action',
                status: 'critical'
            },
            {
                stage: 'Archived',
                days: '90+',
                description: 'Shop archived, candidate for deletion',
                status: 'critical'
            }
        ];

        res.json({
            message: "Shop lifecycle information retrieved",
            error: false,
            success: true,
            data: {
                shopInfo: info,
                warnings,
                lifecycleStages,
                reactivationTip: "Add, update, or delete products to reset the activity timer"
            }
        });    } catch (error) {
        console.error("Get shop lifecycle info error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Update shop status (Admin only)
export const updateShopStatusController = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { status } = req.body;
        const userRole = req.user?.role;

        // Check if user is admin
        if (userRole !== 'admin') {
            return res.status(403).json({
                message: "Access denied. Admin only.",
                error: true,
                success: false
            });
        }

        // Validate status
        const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be one of: " + validStatuses.join(', '),
                error: true,
                success: false
            });
        }

        // Find and update the shop
        const shop = await ShopModel.findByIdAndUpdate(
            shopId,
            { 
                status,
                ...(status === 'active' && {
                    $unset: { 
                        dormancyReason: 1,
                        dormancyDate: 1
                    }
                })
            },
            { new: true }
        ).populate('owner', 'name email avatar');

        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                error: true,
                success: false
            });
        }

        res.json({
            message: `Shop status updated to ${status} successfully`,
            error: false,
            success: true,
            data: shop
        });

    } catch (error) {
        console.error("Update shop status error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};
