import {Router} from 'express';
import auth from '../middleware/auth.js';
import { CashOnDeliveryController, GetOrderDetailsController } from '../controllers/order.controller.js';

const OrderRouter= Router();

OrderRouter.post("/cash-on-delivery",auth,CashOnDeliveryController)
OrderRouter.get("/order-list",auth,GetOrderDetailsController)

export default OrderRouter;