import React from "react";
import { Link, useLocation } from "react-router-dom";

const OrderSuccessContactShop = () => {
  const location = useLocation();
  console.log("useLocation", location.state.text);
  return (    <div className="m-2 w-full max-w-md p-4 py-5 bg-neutral-200 mx-auto flex flex-col justify-center items-center gap-5">
      <p className="text-green-500 font-bold text-center p-5">
        {Boolean(location.state.text) ? location.state.text : "Contact Shop"}{" "}
        Successfully
      </p>
      <div className="flex flex-col gap-3 w-full">
        <Link to={"/chat"} className="border border-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded text-center transition">
          Chat with Seller
        </Link>
        <Link to={"/"} className="border border-green-300 hover:bg-green-500 hover:text-white px-4 py-2 rounded text-center transition">
          Go To Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessContactShop;
