import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET_KEY
});

const uploadImageClodinary = async(file)=>{
    const buffer = file?.buffer || Buffer.from(await file.arrayBuffer());
    
    // Determine resource type based on file mimetype
    let resourceType = 'auto';
    if (file.mimetype?.startsWith('audio/')) {
        resourceType = 'video'; // Cloudinary treats audio as video type
    } else if (file.mimetype?.startsWith('image/')) {
        resourceType = 'image';
    }

    const uploadResult = await new Promise((resolve, reject)=>{
        cloudinary.uploader.upload_stream({ 
            folder: "ABC",
            resource_type: resourceType,
            // For audio files, we might want to specify format
            ...(file.mimetype?.includes('wav') && { format: 'wav' })
        }, (error, uploadResult)=>{
            if (error) {
                console.error('Cloudinary upload error:', error);
                return reject(error);
            }
            return resolve(uploadResult);
        }).end(buffer);
    });

    return uploadResult;
}

export default uploadImageClodinary;