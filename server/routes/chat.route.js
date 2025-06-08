import { Router } from "express";
import auth from "../middleware/auth.js";
import { Admin } from "../middleware/Admin.js";
import {
    createChatController,
    createProductChatController,
    getUserChatsController,
    sendMessageController,
    getChatMessagesController,
    completeOrderController,
    deleteChatController,
    confirmOrderController,
    getOrderDetailsController,
    getAdminChatHistoryController
} from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.post("/create", auth, createChatController);
chatRouter.post("/create-product-chat", auth, createProductChatController);
chatRouter.get("/user-chats", auth, getUserChatsController);
chatRouter.post("/send-message", auth, sendMessageController);
chatRouter.get("/messages/:chatId", auth, getChatMessagesController);
chatRouter.post("/complete-order", auth, completeOrderController);
chatRouter.post("/confirm-order/:chatId", auth, confirmOrderController);
chatRouter.get("/order-details/:chatId", auth, getOrderDetailsController);
chatRouter.delete("/delete/:chatId", auth, deleteChatController);
chatRouter.get("/admin/history", auth, Admin, getAdminChatHistoryController);

export default chatRouter;
