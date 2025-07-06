import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";

const uploadImageController = async(req, res) => {
    try{
        // Handle both single file and multiple files
        const file = req.file || req.files?.[0];
        
        if (!file) {
            return res.status(400).json({
                message: 'No file uploaded',
                error: true,
                success: false
            });
        }
        
        console.log('Uploaded file:', file);
        
        const uploadResult = await uploadImageCloudinary(file);
        
        return res.status(200).json({
            message: "File uploaded successfully",
            data: {
                url: uploadResult.secure_url || uploadResult.url
            },
            image: uploadResult, // Keep for backward compatibility
            error: false,
            success: true
        });
    }catch(error){
        console.error('Upload error:', error);
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export default uploadImageController;