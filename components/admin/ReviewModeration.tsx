import React, { useState, useEffect } from 'react';
import { Review, Faculty, User } from '../../types';
import { updateReviewStatus, listenToReviews, getUserData, getFacultyData } from '../../firebase/services';
import { CheckIcon, XCircleIcon, StarIcon, SearchIcon } from '../Icons';

interface EnrichedReview extends Review {
    facultyName: string;
    userEmail: string;
}

export const ReviewModeration: React.FC = () => {
    const [pendingReviews, setPendingReviews] = useState<EnrichedReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setLoading(true);
        const unsubscribe = listenToReviews('pending', async (reviews) => {
            const enrichedReviews = await Promise.all(
                reviews.map(async (review) => {
                    const faculty = await getFacultyData(review.facultyId);
                    const user = await getUserData(review.userId);
                    return {
                        ...review,
                        facultyName: faculty?.name || 'Unknown Faculty',
                        userEmail: user?.email || 'Unknown User',
                    };
                })
            );
            setPendingReviews(enrichedReviews.sort((a,b) => b.date.toMillis() - a.date.toMillis()));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAction = async (reviewId: string, action: 'approved' | 'rejected') => {
        await updateReviewStatus(reviewId, action);
        // Real-time listener will automatically update the UI
    };

    const filteredReviews = pendingReviews.filter(review => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return review.facultyName.toLowerCase().includes(lowercasedTerm) || 
               review.userEmail.toLowerCase().includes(lowercasedTerm) ||
               review.comment.toLowerCase().includes(lowercasedTerm);
    });

    const renderStars = (rating: number) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(<StarIcon key={i} className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />);
      }
      return <div className="flex items-center gap-1">{stars} <span className="text-sm text-gray-600 ml-2">{rating}/5</span></div>;
    };


    if (loading) {
        return <div className="p-8">Loading pending reviews...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 flex-1 h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Review Moderation</h1>
                    <p className="text-gray-500 mt-1">View, approve, or reject pending faculty reviews.</p>
                </div>
                <div className="relative w-full max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by faculty, student, or comment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                {filteredReviews.length === 0 ? (
                     <div className="p-8 text-center">
                        <p className="text-gray-500">{searchTerm ? 'No matching reviews found.' : 'No pending reviews at the moment.'}</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Faculty Name</th>
                                <th scope="col" className="px-6 py-3">Student Email</th>
                                <th scope="col" className="px-6 py-3">Rating</th>
                                <th scope="col" className="px-6 py-3">Review Text</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReviews.map((review) => (
                                <tr key={review.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {review.facultyName}
                                    </td>
                                    <td className="px-6 py-4">
                                        {review.userEmail}
                                    </td>
                                    <td className="px-6 py-4">
                                        {renderStars(review.rating)}
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <p className="truncate" title={review.comment}>{review.comment}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button 
                                                onClick={() => handleAction(review.id, 'approved')}
                                                className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-green-600"
                                                aria-label={`Approve review for ${review.facultyName}`}
                                            >
                                                <CheckIcon className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(review.id, 'rejected')}
                                                className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-600"
                                                aria-label={`Reject review for ${review.facultyName}`}
                                            >
                                                <XCircleIcon className="w-3.5 h-3.5" />
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};