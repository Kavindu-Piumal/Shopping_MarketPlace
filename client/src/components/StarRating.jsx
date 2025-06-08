import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, size = "text-base", interactive = false, onRatingChange = () => {} }) => {
    const renderStars = () => {
        const stars = [];
        
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                // Full star
                stars.push(
                    <FaStar 
                        key={i} 
                        className={`text-yellow-500 ${size} ${interactive ? 'cursor-pointer hover:text-yellow-600' : ''}`}
                        onClick={() => interactive && onRatingChange(i)}
                    />
                );
            } else if (i <= Math.ceil(rating) && rating % 1 !== 0) {
                // Half star
                stars.push(
                    <FaStarHalfAlt 
                        key={i} 
                        className={`text-yellow-500 ${size} ${interactive ? 'cursor-pointer hover:text-yellow-600' : ''}`}
                        onClick={() => interactive && onRatingChange(i)}
                    />
                );
            } else {
                // Empty star
                stars.push(
                    <FaRegStar 
                        key={i} 
                        className={`text-gray-300 ${size} ${interactive ? 'cursor-pointer hover:text-yellow-600' : ''}`}
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
            {!interactive && (
                <span className="ml-1 text-sm text-gray-600">
                    {rating > 0 ? `(${rating.toFixed(1)})` : ''}
                </span>
            )}
        </div>
    );
};

export default StarRating;
