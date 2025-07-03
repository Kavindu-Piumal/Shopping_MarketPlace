import React from "react";

const CartLoading = () => {
  return (
    <div className="w-full bg-white rounded-eco p-3 sm:p-4 shadow-eco border border-emerald-50 animate-pulse">
      {/* Image skeleton */}
      <div className="bg-emerald-100 h-24 sm:h-28 lg:h-32 w-full rounded-xl mb-2"></div>
      
      {/* Content skeleton */}
      <div className="space-y-2">
        {/* Title lines */}
        <div className="h-3 bg-emerald-200 rounded w-full"></div>
        <div className="h-3 bg-emerald-200 rounded w-3/4"></div>
        
        {/* Unit */}
        <div className="h-2 bg-emerald-100 rounded w-1/2"></div>
        
        {/* Price area */}
        <div className="flex items-center gap-2 mt-3">
          <div className="h-4 bg-emerald-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
        
        {/* Button area */}
        <div className="mt-3">
          <div className="h-8 bg-emerald-100 rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default CartLoading;
