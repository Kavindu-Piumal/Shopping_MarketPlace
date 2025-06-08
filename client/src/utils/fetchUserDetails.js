import Axios from "./Axios"
import summaryApi from "../common/summaryApi"

const fetchUserDetails = async () => {
    try {
        // Check if access token exists before making the request
        const accessToken = localStorage.getItem('accesstoken');
        if (!accessToken) {
            return { success: false, data: null };
        }

        const response = await Axios({
            url: summaryApi.userDetails.url,
            method: summaryApi.userDetails.method,
            withCredentials: true,
        });
        return response.data;

    } catch (error) {
        // Handle 401 Unauthorized silently - user is not logged in
        if (error.response?.status === 401) {
            return { success: false, data: null };
        }
        console.log(error);
        return { success: false, data: null };
    }
}

export default fetchUserDetails