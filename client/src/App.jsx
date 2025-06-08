import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './Store/UserSlice';
import { setAllCategory , setAllSubCategory ,setLoadingCategory } from './Store/ProductSlice';
import { useDispatch } from 'react-redux';
import { use } from 'react';
import Axios from './utils/Axios';
import summaryApi from './common/summaryApi';
import AxiosNotificationError, { setNotificationInstance } from './utils/AxiosNotificationError';
import { handleAdditemCart } from './Store/cartProduct';
import GlobalProvider from './provider/globaleProvider';
import { SocketProvider } from './context/SocketContext';
import { MdAddShoppingCart } from "react-icons/md";
import CartMobileLink from './components/CartMobile';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import NotificationContainer from './components/NotificationContainer';







function App() {

  const dispatch=useDispatch();
  const location=useLocation();
  

  const fetchUser=async()=>{
    //console.log("fetching user");
    const userData=await fetchUserDetails();
    //console.log('userdata',userData);
    
    // Only dispatch user details if the request was successful
    if (userData && userData.success) {
      dispatch(setUserDetails(userData.data));
    } else {
      // User is not logged in or request failed - set null user
      dispatch(setUserDetails(null));
    }
  }

  const fetchCategories = async () => {
      try{

        dispatch(setLoadingCategory(true));
        
        const response=await Axios({
          url: summaryApi.getCategory.url,
          method: summaryApi.getCategory.method
  
        })
        const { data:responseData } = response;
        if(responseData.success){
          dispatch(setAllCategory(responseData.data || []));
          
        }
        
  
  
      }catch(error){
        AxiosNotificationError(error);
      }finally{
        dispatch(setLoadingCategory(false));

        
      }
    }

  const fetchSubCategory = async () => {
      try{
        
        const response=await Axios({
          url: summaryApi.getSubCategory.url,
          method: summaryApi.getSubCategory.method
  
        })
        const { data:responseData } = response;
        if(responseData.success){
          dispatch(setAllSubCategory(responseData.subCategory || []));
          
        }
        
  
  
      }catch(error){
        // Handle subcategory fetch errors silently for now
        console.log('Error fetching subcategories:', error);
        dispatch(setAllSubCategory([]));
      }finally{
        
      }
    }

  
  
    

  useEffect(()=>{
    fetchUser();
    fetchCategories();
    fetchSubCategory();
    //fetchCartItem();
  }
  ,[])

  
    

  return (
  <GlobalProvider>
    <SocketProvider>
      <Header/>
      <main className='min-h-[77vh]'>   
        <Outlet/>
      </main>   
      <Footer/>
      {
        location.pathname !== '/checkout' && (

          <CartMobileLink/>
        )
      }
    </SocketProvider>
  </GlobalProvider> 
   
  );
    
    
}

// Wrapper component with NotificationProvider
function AppWithNotifications() {
  return (
    <NotificationProvider>
      <App />
      <NotificationSetup />
    </NotificationProvider>
  );
}

// Component to set up notification instance for utilities
function NotificationSetup() {
  const notificationContext = useNotification();
  
  useEffect(() => {
    setNotificationInstance(notificationContext);
  }, [notificationContext]);

  return <NotificationContainer 
    notifications={notificationContext.notifications} 
    onClose={notificationContext.removeNotification} 
  />;
}

export default AppWithNotifications;
