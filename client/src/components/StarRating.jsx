import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({
    rating = 0,
    size = "text-base",
    interactive = false,
    showRatingNumber = true,
    onRatingChange = () => {}
}) => {
    // Ensure rating is a valid number
    const numericRating = parseFloat(rating) || 0;

    const renderStars = () => {
        const stars = [];
        
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(numericRating)) {
                // Full star
                stars.push(
                    <FaStar 
                        key={i} 
                        className={`${size} text-yellow-400 ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`}
                        onClick={() => interactive && onRatingChange(i)}
                    />
                );
            } else if (i <= Math.ceil(numericRating) && numericRating % 1 !== 0) {
                // Half star
                stars.push(
                    <FaStarHalfAlt 
                        key={i} 
                        className={`${size} text-yellow-400 ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`}
                        onClick={() => interactive && onRatingChange(i)}
                    />
                );
            } else {
                // Empty star
                stars.push(
                    <FaRegStar 
                        key={i} 
                        className={`${size} text-gray-300 ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`}
                        onClick={() => interactive && onRatingChange(i)}
                    />
                );
            }
        }
        
        return stars;
    };

    return (
        <div className="flex items-center gap-1">
            {renderStars()}
            {!interactive && showRatingNumber && numericRating > 0 && (
                <span className="ml-1 text-sm text-gray-600">
                    {numericRating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
