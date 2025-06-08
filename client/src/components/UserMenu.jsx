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

const userMenu = ({ close }) => {
  const user = useSelector((state) => state.user);
  const disPatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();

  const handleLogout = async () => {
    try {
      const response = await Axios({
        url: summaryApi.logout.url,
        method: summaryApi.logout.method,
        withCredentials: true,
      });      if (response.data.success) {
        if (close) {
          close();
        }

        disPatch(logout());
        localStorage.clear();
        showSuccess(response.data.message);
        navigate("/");
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

  const handleBecomeSeller = async () => {
    try {
      const response = await Axios({
        url: summaryApi.becomeSeller.url,
        method: summaryApi.becomeSeller.method,
        withCredentials: true,
      });
      if (response.data.success) {
        showSuccess(response.data.message);
        // Optionally, update Redux user state here (requires a Redux action to set role to seller)
        window.location.reload(); // Quick way to refresh role in UI
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

  return (
    <div>
      <div className="font-semibold">My Account</div>
      <div className="  text-sm flex items-center gap-2">
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
      </div>

      <Divider />

      {user.role === "user" && (
        <button
          onClick={handleBecomeSeller}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-3 py-1 rounded mb-2"
        >
          Become a Seller
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
          to={"/chat"}
          onClick={close}
          className="rounded px-3 py-2 font-medium bg-emerald-50 hover:bg-emerald-200 text-emerald-800 transition"
        >
          Chat
        </Link>
        {isAdmin(user.role) && (
          <Link
            to={"/dashboard/admin-chat-history"}
            onClick={close}
            className="rounded px-3 py-2 font-medium bg-blue-50 hover:bg-blue-200 text-blue-800 transition"
          >
            Admin Chat History
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="text-left text-red-500 font-semibold hover:underline mt-2"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default userMenu;
