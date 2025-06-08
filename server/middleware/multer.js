import multer from 'multer';    

const storage = multer.memoryStorage(); // Set up storage engine;

const upload = multer({ storage:storage }); // Create multer instance with storage engine

export default upload; // Export the multer instance for use in routes or controllers