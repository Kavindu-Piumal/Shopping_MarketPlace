import {Router} from 'express';
import auth from '../middleware/auth.js';
import { AddSubCategoryController, DeleteSubCategoryController, GetSubCategoryController, UpdateSubCategoryController, GetMySubCategoriesController } from '../controllers/subCategory.controller.js';

const subCategoryRouter = Router();

subCategoryRouter.post('/create',auth,AddSubCategoryController)
subCategoryRouter.post('/get',auth,GetSubCategoryController)
subCategoryRouter.put('/update',auth,UpdateSubCategoryController)
subCategoryRouter.delete("/delete", auth, DeleteSubCategoryController);
subCategoryRouter.get('/my-subcategories', auth, GetMySubCategoriesController);
export default subCategoryRouter;