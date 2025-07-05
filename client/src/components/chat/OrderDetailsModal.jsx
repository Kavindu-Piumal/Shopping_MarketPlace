import React, { useEffect, useState } from 'react';
import { X, Package, MapPin, Calendar, CreditCard, User, Store } from 'lucide-react';
import Axios from '../../utils/Axios';
import summaryApi from '../../common/summaryApi';

const OrderDetailsModal = ({ conversation, onClose, isMobile = false }) => {
    const [fullProductData, setFullProductData] = useState(null);
    const [fullOrderData, setFullOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    if (!conversation.orderId) return null;

    const order = conversation.orderId; // Assuming order details are populated

    // Debug the data structure
    useEffect(() => {
        console.log("=== COMPLETE DATA STRUCTURE DEBUG ===");
        console.log("Full conversation object:", conversation);
        console.log("Full order object (conversation.orderId):", order);

        // Log all possible price locations
        console.log("=== PRICE SEARCH IN ALL LOCATIONS ===");
        console.log("conversation.productId?.price:", conversation.productId?.price);
        console.log("order?.price:", order?.price);
        console.log("order?.product_details:", order?.product_details);
        console.log("order?.totalAmt:", order?.totalAmt);
        console.log("order?.total:", order?.total);
        console.log("order?.amount:", order?.amount);
        console.log("order?.subTotalAmt:", order?.subTotalAmt);
        console.log("order?.quantity:", order?.quantity);

        // Check if order has product info
        if (order?.productId) {
            console.log("order.productId:", order.productId);
            console.log("order.productId.price:", order.productId?.price);
        }

        // Check all order properties
        console.log("All order properties:", Object.keys(order || {}));
        console.log("All conversation properties:", Object.keys(conversation || {}));
        console.log("=== END DEBUG ===");
    }, [conversation, order]);

    // Helper function to format currency properly
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null || isNaN(amount)) return "0";
        return Number(amount).toLocaleString();
    };

    // Extract price information with proper fallback logic
    const getProductPrice = () => {
        // First check if we have fetched full product data
        if (fullProductData?.price && fullProductData.price > 0) {
            console.log("Using fetched product price:", fullProductData.price);
            return fullProductData.price;
        }

        if (fullProductData?.sellingPrice && fullProductData.sellingPrice > 0) {
            console.log("Using fetched product sellingPrice:", fullProductData.sellingPrice);
            return fullProductData.sellingPrice;
        }

        // Fallback to conversation product data (though it's incomplete)
        if (conversation.productId?.price && conversation.productId.price > 0) {
            console.log("Using conversation productId price:", conversation.productId.price);
            return conversation.productId.price;
        }

        // Check if price is in the order object (though it's mostly empty)
        if (order?.totalAmt && order.totalAmt > 0) {
            const quantity = order?.quantity || 1;
            const calculatedPrice = order.totalAmt / quantity;
            console.log("Using calculated price from totalAmt:", calculatedPrice);
            return calculatedPrice;
        }

        console.log("No valid price found, returning 0");
        if (fullProductData) {
            console.log("Available fetched product properties:", Object.keys(fullProductData));
        }
        console.log("Available productId properties:", Object.keys(conversation.productId || {}));
        return 0;
    };

    // Fetch full product data by ID
    const fetchProductData = async (productId) => {
        try {
            const response = await Axios({
                url: summaryApi.getProductDetails.url,
                method: summaryApi.getProductDetails.method,
                data: { productId: productId }
            });
            if (response.data.success) {
                setFullProductData(response.data.data);
                console.log("Full product data fetched:", response.data.data);
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
        }
    };

    // Since we don't have a specific order details endpoint, let's work with what we have
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Fetch full product data if product ID is available
            if (conversation.productId?._id) {
                await fetchProductData(conversation.productId._id);
            }

            setLoading(false);
        };

        fetchData();
    }, [conversation]);

    // Fallback to full data if available
    const effectiveProductData = fullProductData || conversation.productId;
    const effectiveOrderData = fullOrderData || order;

    const productPrice = getProductPrice();
    const quantity = effectiveOrderData?.quantity || 1;
    const subtotal = effectiveOrderData?.subTotalAmt || (productPrice * quantity);
    const totalAmount = effectiveOrderData?.totalAmt || subtotal;

    return (
        <div className={`${
            isMobile 
                ? 'fixed inset-0 bg-white z-50 flex flex-col' 
                : 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4'
        }`}>
            <div className={`${
                isMobile 
                    ? 'w-full h-full flex flex-col' 
                    : 'bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-2xl'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 ${
                    isMobile ? 'bg-white sticky top-0 z-10' : ''
                }`}>
                    <h2 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                        Order Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className={`${
                    isMobile 
                        ? 'flex-1 overflow-y-auto p-4 space-y-6 pb-24' 
                        : 'p-4 space-y-6'
                }`}>
                    {/* Order ID & Status */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Order ID</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                conversation.orderCompleted ? 'bg-green-100 text-green-700' :
                                conversation.orderConfirmed ? 'bg-yellow-100 text-yellow-700' :
                                'bg-orange-100 text-orange-700'
                            }`}>
                                {conversation.orderCompleted ? 'Completed' :
                                 conversation.orderConfirmed ? 'Shipped' : 'Pending'}
                            </span>
                        </div>
                        <p className="font-mono text-sm text-gray-900">
                            {effectiveOrderData?.orderId || 'N/A'}
                        </p>
                    </div>

                    {/* Product Details */}
                    <div>
                        <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                            <Package size={18} />
                            Product Information
                        </h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex gap-4">
                                {effectiveProductData?.image?.[0] && (
                                    <img
                                        src={effectiveProductData.image[0]}
                                        alt={effectiveProductData.name}
                                        className={`rounded-lg object-cover ${
                                            isMobile ? 'w-16 h-16' : 'w-20 h-20'
                                        }`}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">
                                        {effectiveProductData?.name || effectiveOrderData?.product_details?.name}
                                    </h4>
                                    <div className="space-y-1 mt-2">
                                        <p className="text-sm text-gray-600">
                                            Unit Price: LKR {formatCurrency(productPrice)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Quantity: {quantity}
                                        </p>
                                        <p className="text-sm font-medium text-gray-800">
                                            Subtotal: LKR {formatCurrency(subtotal)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buyer & Seller Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                                <User size={18} />
                                Buyer
                            </h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="font-medium text-blue-900">
                                    {conversation.buyerId.name}
                                </p>
                                <p className="text-sm text-blue-700">
                                    {conversation.buyerId.email}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                                <Store size={18} />
                                Seller
                            </h3>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="font-medium text-green-900">
                                    {conversation.sellerId.name}
                                </p>
                                <p className="text-sm text-green-700">
                                    {conversation.sellerId.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {effectiveOrderData?.shippingAddress && (
                        <div>
                            <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                                <MapPin size={18} />
                                Shipping Address
                            </h3>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-sm text-gray-900">
                                    {effectiveOrderData.shippingAddress.address_line_1}
                                </p>
                                {effectiveOrderData.shippingAddress.address_line_2 && (
                                    <p className="text-sm text-gray-900">
                                        {effectiveOrderData.shippingAddress.address_line_2}
                                    </p>
                                )}
                                <p className="text-sm text-gray-900 mt-1">
                                    {effectiveOrderData.shippingAddress.city}, {effectiveOrderData.shippingAddress.state} {effectiveOrderData.shippingAddress.pincode}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {effectiveOrderData.shippingAddress.country}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Payment Information */}
                    <div>
                        <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                            <CreditCard size={18} />
                            Payment Information
                        </h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Payment Method:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    Cash on Delivery (COD)
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">Payment Status:</span>
                                <span className={`text-sm font-medium ${
                                    conversation.orderCompleted ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                    {conversation.orderCompleted ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                            {quantity > 1 && (
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-600">Subtotal ({quantity} items):</span>
                                    <span className="text-sm text-gray-900">
                                        LKR {formatCurrency(subtotal)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                <span className="font-medium text-gray-900">Total Amount:</span>
                                <span className="font-bold text-lg text-gray-900">
                                    LKR {formatCurrency(totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                        <h3 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                            <Calendar size={18} />
                            Order Timeline
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Order Placed</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(effectiveOrderData?.createdAt || conversation.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {conversation.orderConfirmed && (
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Order Shipped</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(conversation.orderConfirmedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {conversation.orderCompleted && (
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Order Completed</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(conversation.completedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Fixed at bottom for mobile */}
                {isMobile && (
                    <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white mb-20">
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Footer for desktop */}
                {!isMobile && (
                    <div className="border-t border-gray-200 p-4">
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailsModal;
