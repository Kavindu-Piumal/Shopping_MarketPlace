import React from "react";
import { useSelector } from "react-redux";
import isAdmin from "../utils/isAdmin";

const AdminPermission = ({ children }) => {
  const user = useSelector((state) => state.user);
  const isSeller = user.role === "seller";
  return (
    <>
      {isAdmin(user.role) || isSeller ? (
        children
      ) : (
        <p className="text-center text-2xl font-semibold">
          You don't have permission to access this page
        </p>
      )}
    </>
  );
};

export default AdminPermission;
