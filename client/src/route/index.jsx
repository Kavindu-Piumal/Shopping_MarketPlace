import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import HotDealsPage from "../pages/HotDealsPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/forgotPassword";
import OtpVerification from "../pages/OtpVerification";
import ResetPassword from "../pages/resetPassword";
import UserMenuMobile from "../pages/UserMenuMobile";
import Dashboard from "../layouts/Dashboard";
import Profile from "../pages/profile";
import MyOrders from "../pages/MyOrders";
import Addresses from "../pages/Addresses";
import Category from "../pages/Category";
import Products from "../pages/Products";
import SubCategory from "../pages/subCategory";
import UploadProduct from "../pages/UploadProduct";
import AdminPermission from "../layouts/AdminPermission";
import ProductAdmin from "../pages/ProductAdmin";
import ProductList from "../pages/ProductList";
import ProductDisplayPage from "../pages/ProductDisplayPage";
import CartMobile from "../pages/CartMobile";
import CheckoutPage from "../pages/CheckoutPage";
import OrderSuccessContactShop from "../pages/OrderSuccessContactShop.JSX";
import Cancel from "../pages/Cancel";
import ChatPage from "../pages/ChatPage";
import AdminChatHistory from "../components/AdminChatHistory";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import SellerOrders from "../pages/SellerOrders";
import ShopsPage from "../pages/ShopsPage";
import ShopDetailPage from "../pages/ShopDetailPage";
import MyShop from "../pages/MyShop";
import ManageShops from "../pages/ManageShops";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children: [
      {
        path: "",
        element: <Home/>
      },
      {
        path: "search",
        element: <SearchPage/>
      },
      {
        path: "hot-deals",
        element: <HotDealsPage/>
      },
      {
        path: "login",
        element: <Login/>
      },
      {
        path: "register",
        element: <Register/>
      },
      {
        path:"forgot-password",
        element:<ForgotPassword/>
      },
      {
        path:"verification-otp",
        element:<OtpVerification/>
      },
      {
        path:"reset-password",
        element:<ResetPassword/>
      },
      {
        path:"user-menu-mobile",
        element:<UserMenuMobile/>
      },
      {
        path: "dashboard",
        element: <Dashboard/>,
        children: [
          {
            path: "profilepage",
            element:<Profile/>
          },          {
            path: "myorders",
            element:<MyOrders/>
          },          {
            path: "seller-orders",
            element: <AdminPermission><SellerOrders/></AdminPermission>
          },          {
            path: "my-shop",
            element: <AdminPermission><MyShop/></AdminPermission>
          },
          {
            path: "address",
            element:<Addresses/>
          },
          {
            path: "category",
            element: <AdminPermission><Category/></AdminPermission>
          },
          {
            path: "subcategory",
            element: <AdminPermission><SubCategory/></AdminPermission>
          },
          {
            path: "uploadproduct",
            element: <AdminPermission><UploadProduct/></AdminPermission>
          },          {
            path: "product",
            element: <AdminPermission><ProductAdmin/></AdminPermission>
          },          {
            path: "admin-chat-history",
            element: <AdminPermission><AdminChatHistory/></AdminPermission>
          },
          {
            path: "manage-shops",
            element: <AdminPermission><ManageShops/></AdminPermission>
          }
      
      ]
      },
      {
        path: ":category",
        children: [
          {
            path: ":subcategory",
            element: <ProductList/>
          }
        ]
      },
      {
        path: "product/:product",
        element: <ProductDisplayPage/>
      },
      {
        path: "cart",
        element: <CartMobile/>
      },
      {
        path: "checkout",
        element: <CheckoutPage/>
      },      {
        path: "/OrderSuccessContactShop",
        element:<OrderSuccessContactShop/>
      },
      {
        path:"/cancel",
        element:<Cancel/>
      },      {
        path: "/chat",
        element: <ChatPage/>
      },      {
        path: "/privacy-policy",
        element: <PrivacyPolicy/>
      },
      {
        path: "/shops",
        element: <ShopsPage/>
      },
      {
        path: "/shop/:shopId",
        element: <ShopDetailPage/>
      }
      
      
  
  ]}
])

export default router;


