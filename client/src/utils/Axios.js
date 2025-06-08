import axios from "axios";
import { baseURL } from "../common/summaryApi";

const Axios=axios.create({
  baseURL: baseURL,
  withCredentials: true,
  
});

Axios.interceptors.request.use(
  async (config)=>{
    const accessToken=localStorage.getItem('accesstoken');
    if(accessToken){
      config.headers.Authorization=`Bearer ${accessToken}`;
  }
  return config;
  },
  (error)=>{
    return Promise.reject(error);
  }
);

//extend the lifespan of access token with the help of refresh token

Axios.interceptors.request.use(
  (response)=>{
    return response;
  },
  async (error)=>{
    let originalRequest=error.config;

    if(error.response.status=== 401 && !originalRequest._retry){
      originalRequest._retry=true;

      const refreshtoken=localStorage.getItem('refreshtoken');

      if(refreshtoken){
        const newAccessToken=await refreshAccessToken(refreshtoken);
        if(newAccessToken){
          localStorage.setItem('accesstoken',newAccessToken);
          originalRequest.headers.Authorization=`Bearer ${newAccessToken}`;
          return Axios(originalRequest);
        }


      }
      
    }
    return Promise.reject(error);
  }
)

const refreshAccessToken=async(refreshToken)=>{
  try{
    const response=await axios({
      url:`${baseURL}/api/user/refresh-token`,
      method:"post",
      headers:{
        Authorization:`Bearer ${refreshToken}`
      }

    })
    const accessToken=response.data.data.accesstoken;
    localStorage.setItem('accesstoken',accessToken);
    return accessToken;
    
  }catch(error){
    console.log(error);
  }

}
      

export default Axios;