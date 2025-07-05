import React, { use } from "react";
import { useSelector } from "react-redux";
import { data, Link } from "react-router-dom";
import Divider from "./Divider";
import summaryApi from "../common/summaryApi";
import { logout } from "../Store/UserSlice";
import { useDispatch } from "react-redux";
import { useNotification } from "../context/NotificationContext";
import { useAxiosNotificationError } from "../utils/AxiosNotificationError";
import Axios from "../utils/Axios";
import { useNavigate } from "react-router-dom";
import { FaLink } from "react-icons/fa6";
import isAdmin from "../utils/isAdmin";
import { useModal } from "../context/ModalContext";
import { useAuthContext } from "../context/AuthContext"; // Add AuthContext

const UserMenu = ({ close, hideTitle = false }) => {
  const user = useSelector((state) => state.user);
  const disPatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();
  const { openCreateShopModal } = useModal();
  const { logout: authLogout } = useAuthContext(); // Use AuthContext logout
  
  const handleLogout = async () => {
    try {
      const response = await Axios({
        url: summaryApi.logout.url,
        method: summaryApi.logout.method,
        withCredentials: true,
      });

      if (response.data.success) {
        if (close) {
          close();
        }

        // Use AuthContext logout for proper state management
        authLogout();
        disPatch(logout());
        showSuccess(response.data.message);
        
        // Force page reload to ensure complete state reset
        window.location.href = "/";
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

  return (
    <div>
      {!hideTitle && <div className="font-semibold">My Account</div>}
      <div className={`text-sm flex items-center gap-2 ${hideTitle ? 'mt-1' : ''}`}>
        <span className="max-w-52 text-ellipsis line-clamp-1">
          {user.name || user.mobile}{" "}
          <span className="text-medium text-red-500">
            {user.role === "admin"
              ? "(Admin)"
              : user.role === "seller"
              ? "(Seller)"
              : ""}
          </span>
        </span>
        <Link
          to={"/dashboard/profilepage"}
          className="hover:text-amber-50"
          onClick={close}
        >
          <FaLink size={15} />
        </Link>
      </div>      <Divider />      {user.role === "user" && (        <button
          onClick={() => openCreateShopModal(() => close && close())}
          className="rounded px-3 py-2 font-medium bg-emerald-50 hover:bg-emerald-200 text-emerald-800 transition w-full text-left"
        >
          🏪 Create Your Shop
        </button>
      )}

      <div className="text-sm grid gap-2 mt-2">
        {(isAdmin(user.role) || user.role === "seller") && (
          <Link
            to={"/dashboard/category"}
            onClick={close}
            className="rounded px-3 py-2 font-medium bg-emerald-50 hover:bg-emerald-200 text-emerald-800 transition"
          >
            Category
          </Link>
        )}
        {(isAdmin(user.role) || user.role === "seller") && (
          <Link
            to={"/dashboard/subcategory"}
            onClick={close}
            className="rounded px-3 py-2 font-medium bg-emerald-50 hover:bg-emerald-200 text-emerald-800 transition"
          >
            Sub Category
          </Link>
        )}
        {(isAdmin(user.role) || user.role === "seller") && (
          <Link
            to={"/dashboard/uploadproduct"}
            onClick={close}
            className="rounded px-3 py-2 font-medium bg-emerald-50 hover:bg-emerald-200 text-emerald-800 transition"
          >
            Upload Product
          </Link>
        )}
        <Link
          to={"/dashboard/product"}
          onClick={close}
          className="rounded px-3 py-2 font-medium bg-emerald-50 hover:bg-emerald-200 text-emerald-800 transition"
        >
          Product
        </Link>        <Link
          to={"/dashboard/myorders"}
          onClick={close}
          className="rounded px-3 py-2 font-medium bg-emerald-50 hover:bg-emerald-200 text-emerald-800 transition"
        >
          My Orders
        </Link>{" "}
        {(isAdmin(user.role) || user.role === "seller") && (
          <Link
            to={"/dashboard/seller-orders"}
            onClick={close}
            className="rounded px-3 py-2 font-medium bg-orange-50 hover:bg-orange-200 text-orange-800 transition"
          >
            Seller Orders
          </Link>        )}
        {(isAdmin(user.role) || user.role === "seller") && (
          <Link
            to={"/dashboard/my-shop"}
            onClick={close}
            className="rounded px-3 py-2 font-medium bg-purple-50 hover:bg-purple-200 text-purple-800 transition"
          >
            🏪 My Shop
          </Link>
        )}
        <Link
          to={"/dashboard/address"}
          onClick={close}
          className="rounded px-3 py-2 font-medium bg-emerald-50 hover:bg-emerald-200 text-emerald-800 transition"
        >
          Save Address
        </Link>{" "}
        <Link
          to="/chat"
          onClick={close}
          state={{ from: 'user-menu' }}
          className="rounded px-3 py-2 font-medium bg-emerald-50 hover:bg-emerald-200 text-emerald-800 transition"
        >
          Chat
        </Link>
        {isAdmin(user.role) && (          <Link
            to={"/dashboard/admin-chat-history"}
            onClick={close}
            className="rounded px-3 py-2 font-medium bg-blue-50 hover:bg-blue-200 text-blue-800 transition"
          >
            Admin Chat History
          </Link>
        )}
        {isAdmin(user.role) && (
          <Link
            to={"/dashboard/manage-shops"}
            onClick={close}
            className="rounded px-3 py-2 font-medium bg-red-50 hover:bg-red-200 text-red-800 transition"
          >
            Manage All Shops
          </Link>
        )}        <button
          onClick={handleLogout}
          className="text-left text-red-500 font-semibold hover:underline mt-2"
        >        Log Out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
