import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import ReviewForm from './ReviewForm';
import { useSelector } from 'react-redux';

const ReviewButton = ({ productId, productName }) => {
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [eligibleOrders, setEligibleOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const auth = useSelector((state) => state.auth);
    const isLoggedIn = auth?.isLoggedIn;

    const checkIfUserCanReview = async () => {
        if (!isLoggedIn || !productId) {
            setCanReview(false);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await Axios({
                ...summaryApi.canUserReview,
                url: `${summaryApi.canUserReview.url}/${productId}`
            });

            if (response.data.success) {
                const { canReview: userCanReview, eligibleOrders: orders } = response.data.data;
                setCanReview(userCanReview);
                setEligibleOrders(orders || []);
            } else {
                setCanReview(false);
                setEligibleOrders([]);
            }
        } catch (error) {
            console.error('Error checking if user can review:', error);
            setCanReview(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkIfUserCanReview();
    }, [productId, isLoggedIn]);

    const handleOpenReviewForm = () => {
        if (!isLoggedIn) {
            // If user is not logged in, redirect to login
            // You can implement redirect logic here or show a message
            return;
        }

        if (canReview) {
            setIsReviewFormOpen(true);
        }
    };

    const handleCloseReviewForm = () => {
        setIsReviewFormOpen(false);
    };

    const handleReviewAdded = () => {
        // Refresh the review status after a review is added
        checkIfUserCanReview();
    };

    return (
        <>
            <button
                onClick={handleOpenReviewForm}
                disabled={loading || !canReview}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 w-full
                    ${canReview 
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100' 
                        : 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed'
                    }`}
            >
                <FaStar className={canReview ? 'text-yellow-500' : 'text-gray-400'} />
                {loading ? 'Checking...' : (canReview ? 'Write a Review' : 'Purchased Required to Review')}
            </button>

            <ReviewForm
                isOpen={isReviewFormOpen}
                onClose={handleCloseReviewForm}
                productId={productId}
                productName={productName}
                eligibleOrders={eligibleOrders}
                onReviewAdded={handleReviewAdded}
            />
        </>
    );
};

export default ReviewButton;
