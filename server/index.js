import express, { response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/connectDB.js';
import UserRouter from './routes/user.route.js';
import categoryRouter from './routes/Category.Routes.js';
import uploadRouter from './routes/upload.Route.js';
import subCategoryRouter from './routes/subCategory.route.js';
import productRouter from './routes/product.Route.js';
import cartRouter from './routes/cart.route.js';
import addressRouter from './routes/address.route.js';
import OrderRouter from './routes/order.route.js';
import chatRouter from './routes/chat.route.js';
import reviewRouter from './routes/review.route.js';




dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL

}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

const PORT = process.env.PORT || 5000;

// Middleware to make io instance available to all routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.use('/api/user', UserRouter);
app.use('/api/category',categoryRouter);
app.use('/api/file',uploadRouter);
app.use('/api/subcategory',subCategoryRouter);
app.use('/api/product',productRouter);
app.use('/api/cart', cartRouter);
app.use("/api/address",addressRouter);
app.use('/api/order',OrderRouter);
app.use('/api/chat', chatRouter);
app.use('/api/review', reviewRouter);

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join', (userId) => {
        connectedUsers.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // Join chat room
    socket.on('join-chat', (chatId) => {
        socket.join(`chat-${chatId}`);
        console.log(`Socket ${socket.id} joined chat-${chatId}`);
    });    // Handle sending messages
    socket.on('send-message', (data) => {
        const { chatId, receiverId, message } = data;
        
        // Emit to chat room only
        // This ensures the message is only received once
        socket.to(`chat-${chatId}`).emit('new-message', message);
        
        // No need to emit to personal room as well
        // This was causing the duplicate messages
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        const { chatId, userId } = data;
        socket.to(`chat-${chatId}`).emit('user-typing', { userId });
    });

    socket.on('stop-typing', (data) => {
        const { chatId, userId } = data;
        socket.to(`chat-${chatId}`).emit('user-stop-typing', { userId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove from connectedUsers map
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
    });
});

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});








