import React from 'react';
import { Review } from '../types';
import { StarRating } from './StarRating';

interface UserPendingReviewProps {
  review: Review;
  onEdit: () => void;
  onDelete: () => void;
}

const UserPendingReview: React.FC<UserPendingReviewProps> = ({ review, onEdit, onDelete }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-blue-800">Your review is pending approval.</p>
          <div className="mt-2">
            <StarRating rating={review.rating} size="sm" />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="mt-4 text-gray-700 italic">"{review.comment}"</p>
    </div>
  );
};

export default UserPendingReview;
