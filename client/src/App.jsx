import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'
import { setAllCategory , setAllSubCategory ,setLoadingCategory } from './Store/ProductSlice';
import { useDispatch } from 'react-redux';
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
import { ModalProvider } from './context/ModalContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { checkAuth } = useAuthContext();

  // 🎯 ENTERPRISE: Initialize authentication state on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth(true); // Force check on app startup
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
      }
    };

    initializeAuth();
  }, []); // Run once on mount

  // 🎯 ENTERPRISE: Optimized data fetching (NO user auth calls here)
  
  // 🚀 UX: Scroll to top on route changes (except for hash navigation)
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

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

  
  
    

  useEffect(() => {
    // 🚀 PERFORMANCE: Only fetch non-auth data on app start
    fetchCategories();
    fetchSubCategory();
  }, [])

  return (
    <GlobalProvider>
      <SocketProvider>
        <Header/>
        <main className='min-h-[77vh]'>   
          <Outlet/>
        </main>   
        <Footer/>
        <MobileBottomNav/>
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
      <ModalProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
        <NotificationSetup />
      </ModalProvider>
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
