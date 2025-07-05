import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCheckCircle, FaComments, FaShoppingBag, FaHome } from "react-icons/fa";
import { MdMessage } from "react-icons/md";

const OrderSuccessContactShop = () => {
  const location = useLocation();
  const successText = Boolean(location.state?.text) ? location.state.text : "Contact Shop";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <FaCheckCircle className="text-green-500 text-3xl" />
              </div>
            </div>
            <h1 className="text-white text-xl md:text-2xl font-bold mb-2">
              Success!
            </h1>
            <p className="text-green-100 text-sm md:text-base">
              {successText} completed successfully
            </p>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-gray-800 text-lg font-semibold mb-2">
                What would you like to do next?
              </h2>
              <p className="text-gray-600 text-sm">
                Continue your shopping experience or get in touch with our sellers
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Chat with Seller Button */}
              <Link
                to="/chat"
                className="group w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 active:scale-95"
              >
                <MdMessage className="text-xl group-hover:animate-pulse" />
                <span className="text-base md:text-lg">Chat with Seller</span>
              </Link>

              {/* Go to Shopping Button */}
              <Link
                to="/"
                className="group w-full bg-white border-2 border-green-400 text-green-600 hover:bg-green-500 hover:text-white px-6 py-4 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 active:scale-95"
              >
                <FaShoppingBag className="text-xl group-hover:animate-bounce" />
                <span className="text-base md:text-lg">Continue Shopping</span>
              </Link>

              {/* Alternative Home Button for smaller screens */}
              <div className="block sm:hidden">
                <Link
                  to="/"
                  className="group w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium text-center transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaHome className="text-lg" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="text-center">
              <p className="text-gray-500 text-xs md:text-sm">
                Thank you for choosing our platform!
              </p>
              <div className="flex justify-center items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-xs font-medium">Order Status: Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards for Tablet and Desktop */}
        <div className="hidden md:grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaComments className="text-emerald-600 text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">24/7 Support</h3>
                <p className="text-gray-600 text-xs">Chat anytime</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaShoppingBag className="text-green-600 text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Easy Shopping</h3>
                <p className="text-gray-600 text-xs">Browse & buy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessContactShop;
