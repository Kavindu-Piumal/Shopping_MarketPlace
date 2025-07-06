import { Router } from "express";
import auth from "../middleware/auth.js";
import { addCategoryController, deleteCategoryController, getAllCategoriesController, updateCategoryController, GetMyCategoriesController } from "../controllers/category.controller.js";

const categoryRouter = Router();


categoryRouter.post("/add-category", auth, addCategoryController);
categoryRouter.get("/get", getAllCategoriesController);
categoryRouter.put("/update", auth, updateCategoryController);
categoryRouter.delete("/delete", auth, deleteCategoryController);
categoryRouter.get("/my-categories", auth, GetMyCategoriesController);


export default categoryRouter;