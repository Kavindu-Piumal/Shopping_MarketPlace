import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const ViewImage = ({ url, close }) => {
  // Handle escape key and prevent body scroll
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [close]);

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };

  // Prevent event propagation when clicking inside the image container
  const handleImageClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg opacity-90 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-md p-4 bg-white relative"
        onClick={handleImageClick}
      >
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
