

import React from 'react';
import { StarIcon } from './Icons';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div 
      className="flex items-center" 
      aria-label={!setRating ? `Rating: ${rating} out of 5 stars` : undefined}
      role={!setRating ? 'img' : undefined}
    >
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            aria-label={setRating ? `Set rating to ${ratingValue} star${ratingValue > 1 ? 's' : ''}` : undefined}
            onClick={() => setRating && setRating(ratingValue)}
            onMouseEnter={() => setRating && setRating(ratingValue)}
            className={`cursor-${setRating ? 'pointer' : 'default'}`}
            disabled={!setRating}
          >
            <StarIcon
              className={`${sizeClasses[size]} ${
                ratingValue <= rating ? 'text-yellow-400' : 'text-gray-300'
              } transition-colors`}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};
