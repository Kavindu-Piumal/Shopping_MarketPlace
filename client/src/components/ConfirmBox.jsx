import React from "react";
import { IoClose } from "react-icons/io5";

const ConfirmBox = ({
  cancel,
  confirm,
  close,
  title = "Permanent Delete",
  message = "Are you sure permanent delete ?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "px-4 py-1 border rounded border-green-600 text-green-600 hover:bg-green-600 hover:text-white",
  cancelButtonClass = "px-4 py-1 border rounded border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
}) => {
  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 z-50 bg-neutral-800 bg-opacity-90 p-4 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-md p-5 rounded-lg shadow-xl border border-gray-200">
        {" "}
        <div className="flex justify-between items-center gap-3 border-b pb-2">
          <h1 className="font-semibold text-lg">{title}</h1>
          <button
            onClick={close}
            className="hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <IoClose size={22} />
          </button>
        </div>
        <p className="my-4">{message}</p>
        <div className="w-fit ml-auto flex items-center gap-3">
          <button onClick={cancel} className={cancelButtonClass}>
            {cancelText}
          </button>
          <button onClick={confirm} className={confirmButtonClass}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
