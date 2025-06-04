import { Router } from "express";
import auth from "../middleware/auth.js";
import { createProductController, deleteProductController, getProductbucategoryandsubcategoryController, getProductbyCategoryController, getProductbyController, getProductController, searchProduct, updateProductDetailsController, getMyProductsController } from "../controllers/product.Controller.js";
import { Admin } from "../middleware/Admin.js";


const productRouter = Router();

// Protected routes (require authentication)
productRouter.post("/create", auth, createProductController)
productRouter.post("/get", auth, getProductController)
productRouter.put("/update-product-details", auth, updateProductDetailsController) 
productRouter.delete("/delete-product", auth, deleteProductController)
productRouter.get("/my-products", auth, getMyProductsController)

// Public routes (no authentication required)
productRouter.post("/getproductby-category", getProductbyCategoryController)
productRouter.post("/getproductby-category-and-subcategory", getProductbucategoryandsubcategoryController)
productRouter.post("/getproductdetails", getProductbyController)
productRouter.post("/search-product", searchProduct);

export default productRouter;