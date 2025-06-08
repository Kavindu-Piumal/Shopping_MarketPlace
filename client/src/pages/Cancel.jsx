import React from "react";
import { Link } from "react-router-dom";

const Cancel = () => {
  return (
    <div className="m-2 w-full max-w-md p-4 py-5 bg-neutral-200 mx-auto flex flex-col justify-center items-center gap-5">
      <p className="text-green-500 font-bold text-center p-5">
        Order Cancelled
      </p>
      <Link
        to={"/"}
        className="border border-green-300 hover:bg-green-500 px-4 py-1 "
      >
        Go To Shopping
      </Link>
    </div>
  );
};

export default Cancel;
