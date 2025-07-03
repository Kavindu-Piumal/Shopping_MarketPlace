import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { DisplayPriceInRupees } from '../utils/displaypriceinrupees';
import { useNotification } from '../context/NotificationContext';
import DashboardMobileLayout from '../components/DashboardMobileLayout';

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const { showSuccess, axiosNotificationError } = useNotification();
    const user = useSelector(state => state.user);

    // Fetch seller orders
    const fetchSellerOrders = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                url: summaryApi.getSellerOrders.url,
                method: summaryApi.getSellerOrders.method,
                withCredentials: true
            });            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setLoading(false);
        }
    };

    // Confirm order
    const handleConfirmOrder = async (orderId) => {
        try {
            setUpdatingOrder(orderId);
            const response = await Axios({
                url: `${summaryApi.confirmOrder.url}/${orderId}`,
                method: summaryApi.confirmOrder.method,
                withCredentials: true
            });            if (response.data.success) {
                showSuccess('Order confirmed successfully! Buyer has been notified.');
                fetchSellerOrders(); // Refresh orders
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setUpdatingOrder(null);
        }
    };

    // Update order status
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setUpdatingOrder(orderId);
            const response = await Axios({
                url: `${summaryApi.updateOrderStatus.url}/${orderId}`,
                method: summaryApi.updateOrderStatus.method,
                data: { status: newStatus },
                withCredentials: true
            });            if (response.data.success) {
                showSuccess(`Order status updated to ${newStatus}! Buyer has been notified.`);
                fetchSellerOrders(); // Refresh orders
            }
        } catch (error) {
            axiosNotificationError(error);
        } finally {
            setUpdatingOrder(null);
        }
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status emoji
    const getStatusEmoji = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'confirmed': return '✅';
            case 'shipped': return '🚛';
            case 'delivered': return '📦';
            case 'cancelled': return '❌';
            default: return '📋';
        }
    };

    // Generate chat link
    const getChatLink = (order) => {
        return `/chat?orderId=${order._id}&with=${order.userId._id}&sellerId=${user._id}`;
    };

    useEffect(() => {
        fetchSellerOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <DashboardMobileLayout>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-800">My Orders</h2>
                    <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg">
                        Total Orders: {orders.length}
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                        <p className="text-gray-500">Orders from customers will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                            <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium self-start ${getStatusBadgeColor(order.order_status)}`}>
                                                {getStatusEmoji(order.order_status)} {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Product</p>
                                                <p className="font-medium">{order.productId?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Customer</p>
                                                <p className="font-medium">{order.userId?.name}</p>
                                                <p className="text-sm text-gray-500">{order.userId?.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Amount</p>
                                                <p className="font-medium text-emerald-600">{DisplayPriceInRupees(order.totalAmt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Payment</p>
                                                <p className="font-medium">{order.payment_status}</p>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            Ordered on: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 w-full">
                                        {/* Chat Button */}
                                        <a
                                            href={getChatLink(order)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                                        >
                                            💬 Chat with Customer
                                        </a>

                                        {/* Status Actions */}
                                        {order.order_status === 'pending' && (
                                            <button
                                                onClick={() => handleConfirmOrder(order._id)}
                                                disabled={updatingOrder === order._id}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                {updatingOrder === order._id ? 'Confirming...' : '✅ Confirm Order'}
                                            </button>
                                        )}

                                        {order.order_status === 'confirmed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'shipped')}
                                                disabled={updatingOrder === order._id}
                                                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                {updatingOrder === order._id ? 'Updating...' : '🚛 Mark as Shipped'}
                                            </button>
                                        )}

                                        {order.order_status === 'shipped' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'delivered')}
                                                disabled={updatingOrder === order._id}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                {updatingOrder === order._id ? 'Updating...' : '📦 Mark as Delivered'}
                                            </button>
                                        )}

                                        {/* Cancel Button (only for pending/confirmed orders) */}
                                        {(order.order_status === 'pending' || order.order_status === 'confirmed') && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                disabled={updatingOrder === order._id}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                {updatingOrder === order._id ? 'Updating...' : '❌ Cancel Order'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </div>
        </DashboardMobileLayout>
    );
};

export default SellerOrders;
