import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUserSecret } from "react-icons/fa6";
import UserProfileAvatarEdit from "../components/UserProfileAvatarEdit";
import Axios from "../utils/Axios";
import summaryApi from "../common/summaryApi";
import { useAxiosNotificationError } from "../utils/AxiosNotificationError";
import { useNotification } from "../context/NotificationContext";
import { setUserDetails } from "../Store/UserSlice";
import fetchUserDetails from "../utils/fetchUserDetails";

const Profile = () => {
  const user = useSelector((state) => state.user);
  const [openProfileAvatarEdit, setProfileAvatarEdit] = useState(false);
  const [userData, setUserData] = useState({
    name: user.name,
    email: user.email,
    mobile: user.mobile,
  });  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { showSuccess } = useNotification();
  const axiosNotificationError = useAxiosNotificationError();

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

      const { data: responseData } = response;      if (responseData.success) {
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
    <div className="p-4">
      {/* profile upload and display */}
      <div className="w-16 h-16 bg-amber-400 flex items-center justify-center rounded-full overflow-hidden drop-shadow-sm">
        {user.avatar ? (
          <img
            alt={user.name}
            src={
              typeof user.avatar === "string" ? user.avatar : user.avatar?.url
            }
            className="w-full h-full rounded-full"
          />
        ) : (
          <FaUserSecret size={50} className="text-red-500" />
        )}
      </div>
      <button
        onClick={() => setProfileAvatarEdit(true)}
        className="text-sm border px-3 min-w-16 py-1 rounded-full mt-3 border-green-200  hover:border-green-700 hover:bg-green-500"
      >
        Edit
      </button>

      {openProfileAvatarEdit && (
        <UserProfileAvatarEdit close={() => setProfileAvatarEdit(false)} />
      )}

      {/*  name , mobile , email , change the password display*/}

      <form className="my-4 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid">
          <label>Name:</label>
          <input
            type="text"
            placeholder="Enter Your Name"
            className="p-2 bg-blue-50 outline-none border focus-within:border-green-300 
                rounded"
            value={userData.name || ""}
            name="name"
            onChange={HandleonChange}
            required
          />
        </div>

        <div className="grid">
          <label htmlFor="email">E-mail:</label>
          <input
            type="text"
            id="email"
            placeholder="Enter Your E-mail"
            className="p-2 bg-blue-50 outline-none border focus-within:border-green-300 
                rounded"
            value={userData.email || ""}
            name="email"
            onChange={HandleonChange}
            required
          />
        </div>

        <div className="grid">
          <label htmlFor="mobile">Mobile:</label>
          <input
            type="text"
            id="mobile"
            placeholder="Enter Your number"
            className="p-2 bg-blue-50 outline-none border focus-within:border-green-300 
                rounded"
            value={userData.mobile || ""}
            name="mobile"
            onChange={HandleonChange}
            required
          />
        </div>

        <button
          className="border px-4 py-2 font-semibold hover:bg-green-300
        border-red-200 text-neutral-800"
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
