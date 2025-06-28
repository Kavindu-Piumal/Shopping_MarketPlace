import { Router } from "express";
import auth from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";
import { createProductController, deleteProductController, getProductbucategoryandsubcategoryController, getProductbyCategoryController, getProductbyController, getProductController, searchProduct, updateProductDetailsController, getMyProductsController } from "../controllers/product.Controller.js";
import { Admin } from "../middleware/Admin.js";


const productRouter = Router();

// Protected routes (require authentication)
productRouter.post("/create", auth, createProductController)
productRouter.post("/get", auth, getProductController)
productRouter.put("/update-product-details", auth, updateProductDetailsController) 
productRouter.delete("/delete-product", auth, deleteProductController)
productRouter.get("/my-products", auth, getMyProductsController)

// Public routes with optional authentication (for seller filtering)
productRouter.post("/getproductby-category", optionalAuth, getProductbyCategoryController)
productRouter.post("/getproductby-category-and-subcategory", optionalAuth, getProductbucategoryandsubcategoryController)
productRouter.post("/getproductdetails", getProductbyController)
productRouter.post("/search-product", optionalAuth, searchProduct);

export default productRouter;