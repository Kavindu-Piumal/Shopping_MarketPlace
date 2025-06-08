import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';


const UploadImages= async (image) => {
    try {
        const formData = new FormData();
        formData.append('image', image);
        
        
        const response = await Axios({
            url: summaryApi.uploadImage.url,
            method: summaryApi.uploadImage.method,
            data: formData,
            
        });
        return response;
    }catch (error) {
        return {
            message: error.message || error,
            error: true,
            success: false
        };
    }
}

export default UploadImages;