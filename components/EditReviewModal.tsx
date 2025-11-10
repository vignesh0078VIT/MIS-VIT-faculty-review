import React, { useState, useRef } from 'react';
import { Review } from '../types';
import { updateReviewContent } from '../firebase/services';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { CloseIcon, SpinnerIcon } from './Icons';
import { StarRating } from './StarRating';

interface EditReviewModalProps {
  review: Review;
  onClose: () => void;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({ review, onClose }) => {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(modalRef, true, onClose);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) {
      setError('Please provide a rating and a comment.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await updateReviewContent(review.id, rating, comment);
      onClose();
    } catch (err) {
      setError('Failed to update review. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg m-4 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-review-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close edit review dialog"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 id="edit-review-modal-title" className="text-2xl font-bold text-gray-800 mb-6">
          Edit Your Review
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Your Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Share your experience..."
              required
            />
          </div>
          {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            >
              {submitting && <SpinnerIcon className="w-5 h-5 mr-2" />}
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReviewModal;
