import React, { useEffect, useState } from 'react';
// Fix: Replaced mockApi with Firebase services.
import { listenToAllFaculty, listenToReviews, listenToStudents } from '../../firebase/services';
import { PendingReviewsIcon, ApprovedReviewsIcon, FacultyManagementIcon, StudentManagementIcon } from '../Icons';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        pendingReviews: 0,
        approvedReviews: 0,
        totalFaculty: 0,
        totalStudents: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fix: Use Firebase listeners to get real-time data.
        const unsubPending = listenToReviews('pending', (reviews) => {
            setStats(prev => ({ ...prev, pendingReviews: reviews.length }));
        });
        const unsubApproved = listenToReviews('approved', (reviews) => {
            setStats(prev => ({ ...prev, approvedReviews: reviews.length }));
        });
        const unsubFaculty = listenToAllFaculty((faculty) => {
            setStats(prev => ({ ...prev, totalFaculty: faculty.length }));
        });
        const unsubStudents = listenToStudents((students) => {
            setStats(prev => ({ ...prev, totalStudents: students.length }));
            setLoading(false); // Assume all data is loaded after students are fetched
        });

        return () => {
            unsubPending();
            unsubApproved();
            unsubFaculty();
            unsubStudents();
        };
    }, []);

    if (loading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
        <div className="p-8 bg-vick-light-gray flex-1 h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={<PendingReviewsIcon className="w-6 h-6"/>} />
                <StatCard title="Approved Reviews" value={stats.approvedReviews} icon={<ApprovedReviewsIcon className="w-6 h-6"/>} />
                <StatCard title="Total Faculty" value={stats.totalFaculty} icon={<FacultyManagementIcon className="w-6 h-6"/>} />
                <StatCard title="Total Students" value={stats.totalStudents} icon={<StudentManagementIcon className="w-6 h-6"/>} />
            </div>
        </div>
    );
};
