import {Router} from 'express';
import auth from '../middleware/auth.js';
import uploadImageController from '../controllers/UploadImages.Controller.js';
import upload from '../middleware/multer.js';

const uploadRouter = Router();

// Support both image and audio file uploads with flexible field names
uploadRouter.post('/upload', auth, upload.any(), uploadImageController);

export default uploadRouter;

