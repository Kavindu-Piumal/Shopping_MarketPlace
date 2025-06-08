import {Router} from 'express';
import auth from '../middleware/auth.js';
import { 
    CashOnDeliveryController, 
    GetOrderDetailsController, 
    ConfirmOrderController, 
    UpdateOrderStatusController, 
    GetSellerOrdersController,
    TestSellerValidationController
} from '../controllers/order.controller.js';

const OrderRouter= Router();

OrderRouter.post("/cash-on-delivery",auth,CashOnDeliveryController)
OrderRouter.get("/order-list",auth,GetOrderDetailsController)
OrderRouter.get("/seller-orders",auth,GetSellerOrdersController)
OrderRouter.put("/confirm/:orderId",auth,ConfirmOrderController)
OrderRouter.put("/status/:orderId",auth,UpdateOrderStatusController)
OrderRouter.post("/test-seller-validation", auth, TestSellerValidationController)

export default OrderRouter;