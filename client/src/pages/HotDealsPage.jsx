import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaFire, FaPercent, FaClock, FaShoppingBag } from 'react-icons/fa';
import CardProduct from '../components/CardProduct';
import CardLoading from '../components/CardLoading';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';

const HotDealsPage = () => {
  const { axiosNotificationError } = useNotification();
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    minDiscount: 40,
    sortBy: 'discount',
    sortOrder: 'desc',
    limit: 20
  });

  // Fetch products with high discounts
  useEffect(() => {
    fetchHotDeals();
  }, [filters]);

  const fetchHotDeals = async () => {
    try {
      setLoading(true);
      
      // For now, we'll fetch all products and filter client-side
      // Later, you can modify the server API to support discount filtering
      const response = await Axios({
        url: summaryApi.getAllProducts.url,
        method: summaryApi.getAllProducts.method,
        data: {
          page: 1,
          limit: 50 // Get more products to filter from
        }
      });

      if (response.data.success) {
        // Filter products with discount >= 40%
        const dealsProducts = response.data.data
          .filter(product => product.discount >= filters.minDiscount)
          .sort((a, b) => b.discount - a.discount) // Sort by highest discount first
          .slice(0, filters.limit);
        
        setHotDeals(dealsProducts);
      }
    } catch (error) {
      console.error('Error fetching hot deals:', error);
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };

  const discountRanges = [
    { label: '40%+ OFF', value: 40, color: 'bg-orange-500' },
    { label: '50%+ OFF', value: 50, color: 'bg-red-500' },
    { label: '60%+ OFF', value: 60, color: 'bg-purple-500' },
    { label: '70%+ OFF', value: 70, color: 'bg-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaFire className="text-3xl text-red-500 animate-bounce" />
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Hot Deals
            </h1>
            <FaFire className="text-3xl text-red-500 animate-bounce" />
          </div>
          <p className="text-gray-600 text-lg">
            🔥 Unbeatable discounts on eco-friendly products! Limited time offers.
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-1 text-red-600">
              <FaPercent />
              <span className="font-semibold">Up to 80% OFF</span>
            </div>
            <div className="flex items-center gap-1 text-orange-600">
              <FaClock />
              <span className="font-semibold">Limited Time</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <FaShoppingBag />
              <span className="font-semibold">{hotDeals.length} Deals</span>
            </div>
          </div>
        </div>

        {/* Discount Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {discountRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setFilters(prev => ({ ...prev, minDiscount: range.value }))}
              className={`px-4 py-2 rounded-full font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                filters.minDiscount === range.value 
                  ? `${range.color} shadow-lg` 
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaFire className="text-red-500" />
            Products with {filters.minDiscount}%+ Discount
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array(12).fill(0).map((_, index) => (
                <CardLoading key={index} />
              ))}
            </div>
          ) : hotDeals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {hotDeals.map((product) => (
                <div key={product._id} className="relative">
                  <CardProduct data={product} />
                  {/* Deal Badge */}
                  <div className="absolute top-2 right-2 z-20">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      🔥 {product.discount}% OFF
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaFire className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No deals found with {filters.minDiscount}%+ discount
              </h3>
              <p className="text-gray-500">
                Try lowering the discount filter or check back later for new deals!
              </p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-center text-white mt-8">
          <h3 className="text-2xl font-bold mb-2">Don't Miss Out!</h3>
          <p className="mb-4">These hot deals won't last forever. Grab them while stocks last!</p>
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            <FaClock />
            <span>Deals refresh daily • Limited quantities available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotDealsPage;
