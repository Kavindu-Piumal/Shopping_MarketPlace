import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import NoDta from "../components/NoDta";

const MyOrders = () => {
  const orders = useSelector((state) => state.orders.order);
  console.log("order", orders);
  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-lime-50 py-6 px-2">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/90 p-6 rounded-xl shadow-lg mb-6 border border-emerald-100 flex items-center gap-3">
          <svg
            className="w-8 h-8 text-emerald-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7h18M3 12h18M3 17h18"
            />
          </svg>
          <h1 className="text-2xl font-bold text-emerald-800 tracking-tight">
            Order Details
          </h1>
        </div>
        {!orders[0] && <NoDta />}
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={order._id + index + "order"}
              className="bg-white/90 p-5 rounded-xl shadow-md border border-emerald-100 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-emerald-200 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={order?.product_details?.image[0]}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-emerald-200 shadow"
                  alt={order?.product_details?.name}
                />
                <div>
                  <p className="font-semibold text-emerald-900 text-lg mb-1">
                    {order?.product_details?.name}
                  </p>                  <p className="text-xs text-emerald-600">
                    Order No:{" "}
                    <span className="font-medium">{order?.orderId}</span>
                  </p>
                  <Link 
                    to="/chat" 
                    className="mt-2 px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition inline-block"
                  >
                    Chat with Seller
                  </Link>
                </div>
              </div>
              {/* Add more order details here if needed */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyOrders;
