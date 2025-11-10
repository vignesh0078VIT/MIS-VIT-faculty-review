import React, { useState, useEffect } from 'react';
import { Review, Faculty, User } from '../../types';
// Fix: Replaced mockApi with Firebase services.
import { listenToReviews, listenToAllFaculty, listenToStudents, updateReviewStatus } from '../../firebase/services';
import { TrashIcon } from '../Icons';
import { StarRating } from '../StarRating';

export const ApprovedReviews: React.FC = () => {
    const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
    const [facultyMap, setFacultyMap] = useState<Record<string, Faculty>>({});
    const [userMap, setUserMap] = useState<Record<string, User>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fix: Use Firebase listeners to get real-time data for reviews, faculty, and students.
        setLoading(true);
        
        const unsubFaculties = listenToAllFaculty((faculties) => {
            const fMap = faculties.reduce((acc, f) => ({ ...acc, [f.id]: f }), {});
            setFacultyMap(fMap);
        });

        const unsubUsers = listenToStudents((users) => {
            const uMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
            setUserMap(uMap);
        });

        const unsubReviews = listenToReviews('approved', (reviews) => {
            // Fix: Sort reviews using Firestore Timestamp's toMillis method.
            setApprovedReviews(reviews.sort((a, b) => b.date.toMillis() - a.date.toMillis()));
            setLoading(false);
        });

        return () => {
            unsubFaculties();
            unsubUsers();
            unsubReviews();
        };
    }, []);

    const handleDelete = async (reviewId: string) => {
        // Fix: Use updateReviewStatus to "delete" by changing status. Listener will update UI.
        await updateReviewStatus(reviewId, 'rejected');
    };

    if (loading) {
        return <div className="p-8">Loading approved reviews...</div>;
    }

    return (
        <div className="p-8 bg-vick-light-gray flex-1 h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Approved Reviews</h1>
            {approvedReviews.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">No reviews have been approved yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {approvedReviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{facultyMap[review.facultyId]?.name || 'Unknown Faculty'}</h3>
                                    <p className="text-sm text-gray-500">
                                        {/* Fix: Use toDate() to correctly format Firestore Timestamp. */}
                                        By: {userMap[review.userId]?.email || 'Unknown User'} on {review.date.toDate().toLocaleDateString()}
                                    </p>
                                    <div className="mt-2">
                                        <StarRating rating={review.rating} size="sm" />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(review.id)}
                                    className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                                    aria-label="Delete"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="mt-4 text-gray-700">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
