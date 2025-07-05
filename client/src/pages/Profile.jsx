import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUserSecret, FaEdit, FaSave, FaUser, FaEnvelope, FaMobile } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserProfileAvatarEdit from "../components/UserProfileAvatarEdit";
import Axios from "../utils/Axios";
import summaryApi from "../common/summaryApi";
import { useAxiosNotificationError } from "../utils/AxiosNotificationError";
import { useNotification } from "../context/NotificationContext";
import { setUserDetails } from "../Store/UserSlice";
import fetchUserDetails from "../utils/fetchUserDetails";
import DashboardMobileLayout from "../components/DashboardMobileLayout";

const Profile = () => {
  const user = useSelector((state) => state.user);
  const [openProfileAvatarEdit, setProfileAvatarEdit] = useState(false);
  const [userData, setUserData] = useState({
    name: user.name,
    email: user.email,
    mobile: user.mobile,
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { showSuccess } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();
  const navigate = useNavigate();

  useEffect(() => {
    setUserData({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
    });
  }, [user]);

  const HandleonChange = (e) => {
    const { name, value } = e.target;

    setUserData((preve) => {
      return {
        ...preve,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await Axios({
        ...summaryApi.updateUserDetails,
        data: userData,
      });

      const { data: responseData } = response;
      if (responseData.success) {
        showSuccess(responseData.message);
        const userData = await fetchUserDetails();
        dispatch(setUserDetails(userData.data));
      }
    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardMobileLayout backLabel="My Account" backTo="/user-menu-mobile">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          {/* Profile Card - Left Side */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                {user.avatar ? (
                  <img
                    alt={user.name}
                    src={typeof user.avatar === "string" ? user.avatar : user.avatar?.url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-100">
                    <FaUserSecret size={64} className="text-amber-500" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold text-center mb-1">{user.name || "User"}</h2>
              <p className="text-gray-500 text-sm mb-4">{user.role === "admin" ? "Administrator" : user.role === "seller" ? "Seller" : "Customer"}</p>

              <button
                onClick={() => setProfileAvatarEdit(true)}
                className="flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors w-full"
              >
                <FaEdit /> Change Profile Picture
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-500 mb-2">Account Information</div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <FaUser className="mr-3 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Username</div>
                    <div className="font-medium">{user.name || "Not set"}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <FaEnvelope className="mr-3 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium">{user.email || "Not set"}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <FaMobile className="mr-3 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="font-medium">{user.mobile || "Not set"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form - Right Side */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaEdit className="mr-2 text-emerald-600" /> Edit Profile Information
            </h3>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={userData.name || ""}
                  name="name"
                  onChange={HandleonChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={userData.email || ""}
                  name="email"
                  onChange={HandleonChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="mobile">Phone Number</label>
                <input
                  type="text"
                  id="mobile"
                  placeholder="Enter your phone number"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={userData.mobile || ""}
                  name="mobile"
                  onChange={HandleonChange}
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full md:w-auto flex items-center justify-center gap-2 text-white font-medium py-3 px-6 rounded-lg ${
                    loading ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
                  } transition-colors`}
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {openProfileAvatarEdit && (
          <UserProfileAvatarEdit close={() => setProfileAvatarEdit(false)} />
        )}
      </div>
    </DashboardMobileLayout>
  );
};

export default Profile;
