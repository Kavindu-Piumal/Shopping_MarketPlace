import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";

export const addToCartController = async (req, res) => {
  try {
    const UserId = req.userId;
    const { productId } = req.body;    if (!productId) {
      return res.status(400).json({
        message: "Product ID and quantity are required",
        error: true,
        success: false,
      });
    }

    // Check if user is trying to add their own product to cart
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    if (product.sellerId && product.sellerId.toString() === UserId) {
      return res.status(400).json({
        message: "You cannot add your own product to cart",
        error: true,
        success: false,
      });
    }

    const checkItemCart = await CartProductModel.findOne({
      userId: UserId,
      productId: productId,
    });

    if (checkItemCart) {
      return res.status(400).json({
        message: "Product already exists in cart",
        error: true,
        success: false,
      });
    }
    const cartItems = new CartProductModel({
      quantity: 1, // Default quantity is set to 1
      userId: UserId,
      productId: productId,
    });

    const save = await cartItems.save();

    const updateCartUser = await UserModel.updateOne(
      { _id: UserId },
      { $push: { shopping_cart: productId } }
    );

    return res.status(200).json({
      message: "Product added to cart successfully",
      data: save,
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getCartItemController = async (req, res) => {
  try {
    const UserId = req.userId;

    const cartItems = await CartProductModel.find({ userId: UserId }).populate(
      "productId"
    );

    return res.status(200).json({
      message: "Cart items fetched successfully",
      data: cartItems,
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const updateCartQtyController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id, qty } = req.body;

    // Only check for _id and qty === undefined (not !qty)
    if (!_id || qty === undefined) {
      return res.status(400).json({
        message: "Product ID and quantity are required",
        error: true,
        success: false,
      });
    }

    // If qty is 0, delete the cart item
    if (qty === 0) {
      const deleteCartItem = await CartProductModel.deleteOne({
        _id: _id,
        userId: userId,
      });
      return res.status(200).json({
        message: "Item removed from cart",
        data: deleteCartItem,
        error: false,
        success: true,
      });
    }

    // Otherwise, update the quantity
    const updateCartItem = await CartProductModel.updateOne(
      {
        _id: _id,
        userId: userId,
      },
      {
        quantity: qty,
      }
    );

    return res.status(200).json({
      message: "Added to Cart successfully",
      data: updateCartItem,
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteCartItemQtyController = async (req, res) => {
  try {
    const userId = req.userId; // middleware
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await CartProductModel.deleteOne({
      _id: _id,
      userId: userId,
    });

    return res.json({
      message: "Item removed",
      error: false,
      success: true,
      data: deleteCartItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
