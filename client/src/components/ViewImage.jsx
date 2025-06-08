import React from "react";
import { IoClose } from "react-icons/io5";

const ViewImage = ({ url, close }) => {
  return (
    <div
      className="fixed top-0 bottom-0 left-0 right-0 p-4
     bg-neutral-800 bg opacity-60 flex items-center justify-center"
    >
      <div className="w-full max-w-md p-4 bg-white relative">
        <button
          onClick={close}
          className="absolute top-2 right-2 z-10 text-gray-700 hover:text-black"
        >
          <IoClose size={25} />
        </button>
        <img
          src={url}
          alt="full screen"
          className="w-full h-full object-scale-down"
        />
      </div>
    </div>
  );
};

export default ViewImage;
