import React, { useState, useEffect } from 'react';
import { Faculty, Review } from '../types';
import { listenToReviewsForFaculty, addReview, listenToUserPendingReviewForFaculty, updateReviewStatus } from '../firebase/services';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { StarRating } from './StarRating';
import SuggestionModal from './SuggestionModal';
import UserPendingReview from './UserPendingReview';
import EditReviewModal from './EditReviewModal';

interface FacultyDetailProps {
  faculty: Faculty;
  onBack: () => void;
}

const FacultyDetail: React.FC<FacultyDetailProps> = ({ faculty, onBack }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [userPendingReview, setUserPendingReview] = useState<Review | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { openLoginModal } = useUI();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToReviewsForFaculty(faculty.id, 'approved', (reviewData) => {
        setReviews(reviewData.sort((a, b) => b.date.toMillis() - a.date.toMillis()));
        setLoading(false);
    });

    return () => unsubscribe();
  }, [faculty.id]);

  useEffect(() => {
    if (user) {
        const unsubscribe = listenToUserPendingReviewForFaculty(user.id, faculty.id, (review) => {
            setUserPendingReview(review);
        });
        return () => unsubscribe();
    }
  }, [faculty.id, user]);


  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setError('You must be logged in to submit a review.');
      return;
    }
    if (rating === 0 || !comment.trim()) {
      setError('Please provide a rating and a comment.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addReview({
        userId: user.id,
        facultyId: faculty.id,
        rating,
        comment,
      });
      setRating(0);
      setComment('');
      setSuccessMessage('Review submitted for approval. Thank you!');
      setTimeout(() => setSuccessMessage(''), 5000);
      // The listener will pick up the new pending review and update the UI
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (userPendingReview && window.confirm('Are you sure you want to delete your pending review?')) {
        await updateReviewStatus(userPendingReview.id, 'rejected');
        // Listener will update the UI automatically
    }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-6 text-blue-600 hover:underline">
        &larr; Back to all faculty
      </button>
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <img className="w-32 h-32 rounded-full object-cover shadow-md" src={faculty.avatarUrl} alt={faculty.name} />
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-gray-800">{faculty.name}</h2>
            <p className="text-xl text-gray-600">{faculty.department}</p>
            <p className="mt-4 text-gray-700">{faculty.bio}</p>
          </div>
        </div>

        <hr className="my-8" />

        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Reviews</h3>
          {loading ? (
            <p>Loading reviews...</p>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <StarRating rating={review.rating} size="sm" />
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    - Anonymous Student on {review.date.toDate().toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No approved reviews yet for this faculty member.</p>
          )}
        </div>

        <hr className="my-8" />

        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {userPendingReview ? 'Your Pending Review' : 'Leave a Review'}
          </h3>
           {successMessage && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{successMessage}</span>
                </div>
            )}
          {isAuthenticated ? (
             userPendingReview ? (
                <UserPendingReview 
                    review={userPendingReview}
                    onEdit={() => setShowEditModal(true)}
                    onDelete={handleDeleteReview}
                />
            ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <StarRating rating={rating} setRating={setRating} />
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Your Comment</label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Share your experience..."
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex justify-between items-center mt-4">
                     <button 
                      type="button"
                      onClick={() => setShowSuggestionModal(true)}
                      className="px-4 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Need a suggestion?
                     </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
            )
          ) : (
            <p className="text-gray-600">Please <button onClick={openLoginModal} className="text-blue-600 underline">log in</button> to leave a review.</p>
          )}
        </div>
      </div>
      {showSuggestionModal && <SuggestionModal onClose={() => setShowSuggestionModal(false)} facultyName={faculty.name} />}
      {showEditModal && userPendingReview && (
          <EditReviewModal review={userPendingReview} onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
};

export default FacultyDetail;