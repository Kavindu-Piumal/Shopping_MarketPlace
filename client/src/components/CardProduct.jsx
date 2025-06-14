import React, { useState, useEffect } from "react";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { Link } from "react-router-dom";
import validUrl from "../utils/validUrl";
import { PriceWithDiscount } from "../utils/PricewithDiscount";
import summaryApi from "../common/summaryApi";
import { useNotification } from "../context/NotificationContext";
import Axios from "../utils/Axios";
import { useGlobalcontext } from "../provider/globaleProvider";
import AddtoCartButton from "./addtoCartButton";
import StarRating from "./StarRating";

const CardProduct = ({ data }) => {
  const { axiosNotificationError } = useNotification();
  // Add null safety checks
  if (!data || !data._id || !data.name) {
    return null; // Don't render if data is invalid
  }

  const url = `/product/${validUrl(data.name)}-${data._id}`;
  const [loading, setLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);

  // Fetch review statistics for this product
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const response = await Axios({
          ...summaryApi.getProductReviews,
          url: `${summaryApi.getProductReviews.url}/${data._id}?page=1&limit=1`
        });

        if (response.data.success) {
          const { stats } = response.data.data;
          if (stats.totalReviews > 0) {
            setReviewStats(stats);
          }
        }
      } catch (error) {
        // Silently fail for product cards
        console.error('Error fetching review stats:', error);
      }
    };

    if (data._id) {
      fetchReviewStats();
    }
  }, [data._id]);

  return (
    <Link
      to={url}
      className="card w-36 lg:w-52 min-w-36 lg:min-w-52 bg-white rounded-eco p-4 shadow-eco border border-emerald-50 group relative overflow-hidden hover:shadow-lg transition-shadow"
    >      {/* Eco Badge */}
      {data.discount > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <div className="eco-badge">♻️ {data.discount}% OFF</div>
        </div>
      )}
      <div className="bg-emerald-50 min-h-20 w-full rounded-xl flex items-center justify-center mb-2">
        <img
          src={data.image && data.image[0] ? data.image[0] : '/placeholder.jpg'}
          className="w-full h-28 object-contain group-hover:scale-105 transition-transform duration-200"
          alt={data.name || 'Product'}
        />
      </div>
      <div className="mt-2 w-full">
        <div className="w-full text-ellipsis line-clamp-2 py-1 font-semibold text-emerald-800">
          {data.name}
        </div>        <div className="w-full text-xs lg:text-sm line-clamp-1 text-emerald-600 mb-1">
          {data.unit}
        </div>
        
        {/* Review Rating Display */}
        {reviewStats && reviewStats.totalReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <StarRating rating={reviewStats.averageRating} size="text-xs" />
            <span className="text-xs text-gray-500">
              ({reviewStats.totalReviews})
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-base mb-2">
          <span className="font-bold text-emerald-700">
            {DisplayPriceInRupees(PriceWithDiscount(data.price, data.discount))}
          </span>
          {data.discount > 0 && (
            <span className="text-neutral-400 line-through text-xs">
              {DisplayPriceInRupees(data.price)}
            </span>
          )}
        </div>
        <div className="mt-2">
          {data.stock == 0 ? (
            <div className="text-red-500 text-center bg-red-50 py-2 rounded-lg font-medium text-xs">
              ❌ Out Of Stock
            </div>
          ) : (
            <AddtoCartButton data={data} />
          )}
        </div>
      </div>
    </Link>
  );
};

export default CardProduct;
