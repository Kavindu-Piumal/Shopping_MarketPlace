import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const MobileBackButton = ({ 
  label = "Back", 
  to = null, 
  className = "", 
  showOnDesktop = false,
  isFixed = false // default to static
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  const baseClasses = `
    ${showOnDesktop ? 'inline-flex' : 'inline-flex lg:hidden'}
    items-center gap-2 text-gray-600 hover:text-gray-800 
    bg-white/95 hover:bg-white px-3 py-1.5
    transition-all border border-gray-200 hover:border-gray-300
    text-sm font-medium shadow-sm backdrop-blur-sm rounded-lg
    ${className}
  `;

  // Only apply fixed positioning if isFixed is true
  const positionClasses = isFixed ? 'fixed top-16 left-4 z-40' : '';

  return (
    <button
      onClick={handleBack}
      className={`${baseClasses} ${positionClasses}`}
      aria-label={`Go back to ${label.toLowerCase()}`}
    >
      <FaArrowLeft size={14} />
      <span>{label}</span>
    </button>
  );
};

export default MobileBackButton;
