import React from "react";
import UserMenu from "../components/UserMenu";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const user = useSelector((state) => state.user);

  //console.log("user", user);

  return (
    <section className="bg-white">
      <div className="container mx-auto p-3 grid lg:grid-cols-[280px_1fr] gap-4">
        {/* Dashboard content menu goes here */}
        <div className="py-4 sticky top-24 max-h-[calc(100vh-100px)] overflow-y-auto hidden lg:block border-r">
          <UserMenu />
        </div>

        {/* Dashboard content goes here */}
        <div className="bg-green-100 p-4 min-h[60vh]">
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
