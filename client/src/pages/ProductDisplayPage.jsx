
import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import summaryApi from "../common/summaryApi";
import Axios from "../utils/Axios";
import { useNotification } from "../context/NotificationContext";
import { FaAngleRight, FaAngleLeft, FaLeaf, FaRecycle, FaShieldAlt, FaTruck } from "react-icons/fa";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import Divider from "../components/Divider";
import download from "../assets/download.jpg";
import bo from "../assets/bo.png";
import ef from "../assets/ef.jpg";
import { PriceWithDiscount } from "../utils/PricewithDiscount";
import AddtoCartButton from "../components/addtoCartButton";
import ChatWithSellerButton from "../components/ChatWithSellerButton";
import ReviewSection from "../components/ReviewSection";
import ReviewButton from "../components/ReviewButton";
import ReviewForm from "../components/ReviewForm";
import StarRating from "../components/StarRating";


const ProductDisplayPage = () => {
  const params = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const user = useSelector(state => state.user);
  const { showSuccess, showError, axiosNotificationError } = useNotification();
  
  // Check for review parameters
  const showReview = searchParams.get('review') === 'true';
  const orderId = searchParams.get('orderId');
  const chatId = searchParams.get('chatId');
  
  const productId = params?.product?.split("-")?.slice(-1)[0];
  const [data, setData] = useState({
    name: "",
    image: [],
  });
  const [loading, setLoading] = useState(false);
  const [image, Setimage] = useState(0);  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const imageContaiener = useRef();

  // Scroll to top when component mounts or productId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);
  const fetchproductDetails = async () => {
    try {
      const response = await Axios({
        url: summaryApi.getProductDetails.url,
        method: summaryApi.getProductDetails.method,
        data: {
          productId: productId,
        },
      });

      const { data: responseData } = response;

            if (responseData.success) {
        setData(responseData.data);
      }
    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchEligibleOrders = async () => {
    try {
      const response = await Axios({
        url: `${summaryApi.canUserReview.url}/${productId}`,
        method: summaryApi.canUserReview.method
      });

      if (response.data.success) {
                const { eligibleOrders: orders } = response.data.data;
        setEligibleOrders(orders || []);
      }
    } catch (error) {
      axiosNotificationError(error);
    }
  };

  useEffect(() => {
    fetchproductDetails();
  }, [params]);  // Auto-open review form when redirected from order completion
  useEffect(() => {
    // Only run once when component mounts and if we have the required parameters
    if (showReview && orderId && chatId && productId && user?._id) {
      const handleAutoOpen = async () => {
        try {
          const response = await Axios({
            url: `${summaryApi.canUserReview.url}/${productId}`,
            method: summaryApi.canUserReview.method
          });

          if (response.data.success) {
            const { eligibleOrders: orders } = response.data.data;
            setEligibleOrders(orders || []);
            
            // Check if this specific order is in the eligible orders
            const orderInList = orders?.find(order => 
              order.orderId === orderId && order.chatId === chatId
            );
              if (orderInList) {
              setReviewFormOpen(true);
              showSuccess('Please share your review for this product!');
            } else if (orders && orders.length > 0) {
              setReviewFormOpen(true);
              showSuccess('Please share your review for this product!');
            } else {
              showError('This order is not eligible for review yet');
            }
          } else {
            showError('Unable to verify review eligibility');
          }
        } catch (error) {
          console.error('Error fetching eligible orders:', error);
                    showError('Unable to load review form. Please try again.');
        }
        
        // Clear URL parameters to avoid re-opening on refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      };

      handleAutoOpen();
    } else if (showReview && (!user?._id)) {
      showError('Please log in to add a review');
      // Clear URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []); // Empty dependency array - only run once on mount

  const handleScrollRight = () => {
    imageContaiener.current.scrollLeft += 100;
  };
  const handleScrollLeft = () => {
    imageContaiener.current.scrollLeft -= 100;
  };
  // Helper function to check if there's a valid discount
  const hasValidDiscount = (discount) => {
    if (!discount) return false;
    const numDiscount = Number(discount);
    return !isNaN(numDiscount) && numDiscount > 0;
  };  const handleReviewAdded = async () => {
    // Close the review form first
    setReviewFormOpen(false);
    
    // Wait a moment for the database to update
    setTimeout(async () => {
      try {
        // Refresh the product data to update review statistics
        await fetchproductDetails();
        
        // Trigger review section refresh using the ref
        if (reviewSectionRef.current && reviewSectionRef.current.refreshReviews) {
          reviewSectionRef.current.refreshReviews();
        }
          // Also fetch eligible orders in case they changed
        await fetchEligibleOrders();
        
        showSuccess('Review added and display updated!');
      } catch (error) {
        console.error('Error refreshing reviews:', error);
        // Retry once more
        setTimeout(() => {
          if (reviewSectionRef.current && reviewSectionRef.current.refreshReviews) {
            reviewSectionRef.current.refreshReviews();
          }
        }, 1000);
      }
    }, 500);
  };

  const handleReviewStatsChange = (stats) => {
    setReviewStats(stats);
  };

  // Create ref for ReviewSection to call its methods
  const reviewSectionRef = useRef();
  return (
    <section className="container mx-auto p-2 lg:p-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-4 mobile-product-container">
        {/* Mobile Product Images */}
        <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden mobile-product-card">        {/* Main Image */}
        <div className="h-80 w-full relative product-image-container">
          {data.image[image] ? (
            <img
              src={data.image[image]}
              alt={data.name}
              className="w-full h-full object-contain touch-manipulation"
              style={{ touchAction: 'pan-x pan-y' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
          
          {/* Image navigation arrows for mobile */}
          {data.image.length > 1 && (
            <>                <button
                  onClick={() => Setimage(image > 0 ? image - 1 : data.image.length - 1)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 touch-optimized mobile-action-button"
                >
                  <FaAngleLeft className="text-gray-700" />
                </button>
                <button
                  onClick={() => Setimage(image < data.image.length - 1 ? image + 1 : 0)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 touch-optimized mobile-action-button"
                >
                <FaAngleRight className="text-gray-700" />
              </button>
            </>
          )}
        </div>
          
          {/* Mobile Image Indicators */}
          <div className="flex items-center justify-center gap-2 py-3 bg-gray-50">
            {data.image.map((img, index) => (
              <div
                key={img + index + "mini"}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-200 ${
                  image === index ? "bg-green-500 w-6" : "bg-gray-300"
                }`}
                onClick={() => Setimage(index)}
              ></div>
            ))}
          </div>
          
          {/* Mobile Thumbnail Strip */}
          <div className="p-4 bg-gray-50">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide mobile-thumbnail-scroll pb-2" style={{ touchAction: 'pan-x' }}>
              {data.image.map((img, index) => (
                <div 
                  className={`min-w-20 h-20 rounded-xl border-3 transition-all duration-200 flex-shrink-0 ${
                    image === index 
                      ? "border-green-500 ring-2 ring-green-200 shadow-lg" 
                      : "border-gray-200 hover:border-green-300"
                  }`} 
                  key={img + index}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover rounded-lg cursor-pointer touch-manipulation"
                    alt="thumbnail"
                    onClick={() => Setimage(index)}
                    style={{ touchAction: 'manipulation' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Product Info */}
        <div className="bg-white rounded-xl shadow-lg border border-green-100 p-5 space-y-5 mobile-product-card">
          {/* Sustainability Badge */}
          <div className="flex items-center gap-2">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 touch-optimized">
              <FaLeaf className="text-sm" />
              Eco-Friendly Product
            </div>
          </div>

          {/* Product Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3 leading-tight product-title-mobile">{data.name}</h1>
            <div className="flex flex-col gap-3 text-sm">
              <span className="bg-green-100 text-green-800 px-3 py-2 rounded-lg inline-block w-fit font-medium">
                Unit: {data.unit}
              </span>
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={reviewStats.averageRating} size="text-base" />
                  <span className="text-sm text-gray-600 font-medium">
                    ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Pricing */}
          <div className="mobile-price-container p-5 rounded-xl border-2 border-green-200">
            <p className="text-gray-700 text-base mb-3 font-medium">Price</p>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="font-bold text-3xl text-green-700 product-price-mobile">
                {DisplayPriceInRupees(PriceWithDiscount(data.price, data.discount)) || "Price on Request"}
              </p>
              {hasValidDiscount(data.discount) && (
                <>
                  <p className="text-gray-500 line-through text-xl">
                    {DisplayPriceInRupees(data.price)}
                  </p>
                  <div className="bg-red-500 text-white px-3 py-2 rounded-full font-bold text-sm">
                    {data.discount}% OFF
                  </div>
                </>
              )}
            </div>
            {hasValidDiscount(data.discount) && (
              <p className="text-green-700 text-sm mt-2 font-medium">
                You save {DisplayPriceInRupees(data.price - PriceWithDiscount(data.price, data.discount))}!
              </p>
            )}
          </div>

          {/* Mobile Action Buttons */}
          {data.stock === 0 ? (
            <div className="bg-red-50 border-2 border-red-200 p-5 rounded-xl text-center">
              <p className="text-red-600 font-bold text-lg">Out of Stock</p>
              <p className="text-red-500 text-sm mt-2">We'll notify you when it's back!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AddtoCartButton data={data} />
              <div className="grid grid-cols-1 gap-3">
                <ChatWithSellerButton product={data} className="w-full py-3 text-base font-medium mobile-action-button touch-optimized" />
                <ReviewButton productId={productId} productName={data.name} className="py-3 text-base font-medium mobile-action-button touch-optimized" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Product Description */}
        <div className="bg-white rounded-xl shadow-lg border border-green-100 p-5 mobile-product-card mobile-section">
          <h3 className="font-bold text-xl text-green-800 mb-4 flex items-center gap-2">
            <FaLeaf className="text-green-600" />
            Product Description
          </h3>
          <p className="text-gray-700 leading-relaxed text-base product-description-mobile">
            {data.description || "Discover this eco-friendly product designed with sustainability in mind. Made with environmentally conscious materials and processes."}
          </p>
        </div>

        {/* Mobile Additional Details */}
        {data?.more_details && Object.keys(data.more_details).length > 0 && (
          <div className="space-y-4">
            {Object.keys(data.more_details).map((element, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-green-100 p-5 mobile-product-card mobile-section">
                <h3 className="font-bold text-lg text-green-800 capitalize mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {element.replace('_', ' ')}
                </h3>
                <p className="text-gray-700 text-base leading-relaxed product-description-mobile">
                  {data.more_details[element] || "Details coming soon"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Sustainability Benefits */}
        <div className="bg-white rounded-xl shadow-lg border border-green-100 p-5 mobile-product-card mobile-section">
          <h2 className="font-bold text-xl text-green-800 mb-5 flex items-center gap-2">
            <FaLeaf className="text-green-600 text-xl" />
            Why Choose Sustainable?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 touch-optimized">
              <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                <FaTruck className="text-green-600 text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-base mb-1">Carbon-Neutral Delivery</h3>
                <p className="text-gray-600 text-sm leading-relaxed product-description-mobile">
                  Eco-friendly delivery options that care for the planet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 touch-optimized">
              <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                <FaRecycle className="text-blue-600 text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-base mb-1">Sustainable Packaging</h3>
                <p className="text-gray-600 text-sm leading-relaxed product-description-mobile">
                  100% recyclable materials for a greener future
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 touch-optimized">
              <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                <FaShieldAlt className="text-green-600 text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-base mb-1">Quality Guaranteed</h3>
                <p className="text-gray-600 text-sm leading-relaxed product-description-mobile">
                  Ethically sourced with verified credentials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Keep Original */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        {/* Desktop Product Images Section */}
        <div className="space-y-4">
          {/* Main Product Image */}
          <div className="bg-white lg:min-h-[65vh] lg:min-w-[65vh] min-h-56 max-h-56 h-full w-full rounded-xl shadow-lg border-2 border-green-100 overflow-hidden">
            {data.image[image] ? (
              <img
                src={data.image[image]}
                alt={data.name}
                className="w-full h-full object-scale-down rounded-xl hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          {/* Image Indicators */}
          <div className="flex items-center justify-center gap-2 my-2">
            {data.image.map((img, index) => (
              <div
                key={img + index + "mini"}
                className={`lg:w-6 lg:h-6 w-3 h-3 rounded-full cursor-pointer transition-all duration-200 ${
                  image === index ? "bg-green-500 ring-2 ring-green-300" : "bg-gray-300 hover:bg-green-200"
                }`}
                onClick={() => Setimage(index)}
              ></div>
            ))}
          </div>

          {/* Thumbnail Images */}
          <div className="grid relative">
            <div
              ref={imageContaiener}
              className="flex gap-3 z-10 relative overflow-x-auto scrollbar-hide lg:scrollbar-none pb-2"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {data.image.map((img, index) => (
                <div 
                  className={`min-w-20 h-20 shadow-md rounded-lg border-2 transition-all duration-200 ${
                    image === index ? "border-green-500 ring-2 ring-green-200" : "border-gray-200 hover:border-green-300"
                  }`} 
                  key={img + index}
                >
                  <img
                    src={img}
                    className="w-full h-full object-scale-down rounded-lg cursor-pointer"
                    alt="mini-image"
                    onClick={() => Setimage(index)}
                  />
                </div>
              ))}
            </div>
            <div className="hidden lg:flex w-full justify-between absolute h-full -ml-2 items-center">
              <button
                onClick={handleScrollLeft}
                className="z-10 bg-white hover:bg-green-50 p-2 rounded-full shadow-lg border border-green-200 transition-colors duration-200"
              >
                <FaAngleLeft className="text-green-600" />
              </button>
              <button
                onClick={handleScrollRight}
                className="z-10 bg-white hover:bg-green-50 p-2 rounded-full shadow-lg border border-green-200 transition-colors duration-200"
              >
                <FaAngleRight className="text-green-600" />
              </button>
            </div>
          </div>

          {/* ...existing desktop sections... */}
          {/* Product Description - Single Section */}
          <div className="py-4 my-4 bg-white rounded-xl shadow-md border border-green-100">
            <div className="px-4">
              <h3 className="font-semibold text-lg text-green-800 mb-2 flex items-center gap-2">
                <FaLeaf className="text-green-600" />
                Product Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {data.description || "Discover this eco-friendly product designed with sustainability in mind. Made with environmentally conscious materials and processes."}
              </p>
            </div>
          </div>

          {/* Product Details */}
          <div className="py-4 bg-white rounded-xl shadow-md border border-green-100">
            <div className="px-4">
              <h3 className="font-semibold text-lg text-green-800 mb-2">Units & Packaging</h3>
              <p className="text-gray-700">
                {data.unit || "Eco-friendly packaging"}
              </p>
            </div>
          </div>

          {/* Additional Details */}
          {data?.more_details && Object.keys(data.more_details).length > 0 && (
            <div className="space-y-3">
              {Object.keys(data.more_details).map((element, index) => (
                <div key={index} className="py-4 bg-white rounded-xl shadow-md border border-green-100">
                  <div className="px-4">
                    <h3 className="font-semibold text-green-800 capitalize mb-2">{element.replace('_', ' ')}</h3>
                    <p className="text-gray-700">
                      {data.more_details[element] || "Details coming soon"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Product Information Section */}
        <div className="p-6 lg:p-8 space-y-6">
          {/* ...rest of existing desktop content... */}
          {/* Sustainability Badge */}
          <div className="flex items-center gap-2">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <FaLeaf className="text-xs" />
              Eco-Friendly
            </div>
          </div>

          {/* Product Title */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{data.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Unit: {data.unit}
              </span>
              {/* Display average rating if available */}
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={reviewStats.averageRating} size="text-sm" />
                  <span className="text-sm text-gray-600">
                    ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Pricing Section */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-green-100">
            <p className="text-gray-600 text-lg mb-3">Price</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="border-2 border-green-400 px-6 py-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100">
                <p className="font-bold text-2xl lg:text-3xl text-green-700">
                  {DisplayPriceInRupees(PriceWithDiscount(data.price, data.discount)) || "Price on Request"}
                </p>
              </div>
              {hasValidDiscount(data.discount) && (
                <>
                  <p className="text-gray-500 line-through text-lg">
                    {DisplayPriceInRupees(data.price)}
                  </p>
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                    {data.discount}% OFF
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {data.stock === 0 ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center">
              <p className="text-red-600 font-semibold text-lg">Out of Stock</p>
              <p className="text-red-500 text-sm mt-1">We'll notify you when it's back!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AddtoCartButton data={data} />
              <ChatWithSellerButton product={data} className="w-full" />
              <ReviewButton productId={productId} productName={data.name} />
            </div>
          )}

          {/* Sustainability Benefits */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <h2 className="font-bold text-xl text-green-800 mb-4 flex items-center gap-2">
              <FaLeaf className="text-green-600" />
              Why Choose Sustainable Shopping?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FaTruck className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Carbon-Neutral Delivery</h3>
                  <p className="text-gray-600 text-sm">
                    Eco-friendly delivery options that minimize environmental impact
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaRecycle className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Sustainable Packaging</h3>
                  <p className="text-gray-600 text-sm">
                    100% recyclable and biodegradable packaging materials
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FaShieldAlt className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Quality Guaranteed</h3>
                  <p className="text-gray-600 text-sm">
                    Ethically sourced products with verified sustainability credentials
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <FaLeaf className="text-emerald-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Planet Positive Impact</h3>
                  <p className="text-gray-600 text-sm">
                    Every purchase contributes to environmental conservation efforts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - Full Width */}
      <div className="mt-8 mobile-section">
        <ReviewSection 
          ref={reviewSectionRef}
          productId={productId} 
          productName={data.name} 
          onReviewChange={handleReviewStatsChange}
          className="mobile-product-card"
        />
      </div>

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={reviewFormOpen}
        onClose={() => setReviewFormOpen(false)}
        productId={productId}
        productName={data.name}
        eligibleOrders={eligibleOrders}
        onReviewAdded={handleReviewAdded}
        preSelectedOrderId={orderId}
        preSelectedChatId={chatId}
      />
    </section>
  );
};

export default ProductDisplayPage;
