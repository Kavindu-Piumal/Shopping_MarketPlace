import {Router} from 'express';
import auth from '../middleware/auth.js';
import { addToCartController, deleteCartItemQtyController, getCartItemController, updateCartQtyController } from '../controllers/cartcontroller.js';

const cartRouter = Router();

cartRouter.post('/create',auth,addToCartController)
cartRouter.get('/get',auth, getCartItemController);
cartRouter.put('/update-qty',auth,updateCartQtyController)
cartRouter.delete('/delete-cart-item',auth,deleteCartItemQtyController)

export default cartRouter;
// This file sets up the cart routes for the application. 