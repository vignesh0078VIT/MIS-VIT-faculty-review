import React, { useState, useEffect } from 'react';
import { listenToStudents, approveLogout, toggleStudentActiveState } from '../../firebase/services';
import { User } from '../../types';
import { SpinnerIcon } from '../Icons';

export const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = listenToStudents((studentData) => {
            setStudents(studentData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleApproveLogout = async (userId: string) => {
        setProcessingId(userId);
        await approveLogout(userId);
        setProcessingId(null);
        // UI will update via listener
    };
    
    const handleToggleActive = async (userId: string, currentState: boolean) => {
        const action = currentState ? "deactivate" : "reactivate";
        if (window.confirm(`Are you sure you want to ${action} this student?`)) {
            setProcessingId(userId);
            await toggleStudentActiveState(userId, !currentState);
            setProcessingId(null);
            // UI will update via listener
        }
    };

    const getStatusPill = (student: User) => {
        if (!student.isActive) {
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Deactivated</span>;
        }
        if (student.logoutPending) {
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Logout Pending</span>;
        }
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
    };

    if (loading) {
        return <div className="p-8">Loading students...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 flex-1 h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Management</h1>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student Email</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{student.email}</td>
                                <td className="px-6 py-4">{getStatusPill(student)}</td>
                                <td className="px-6 py-4 text-center space-x-4">
                                    {processingId === student.id ? (
                                        <div className="flex justify-center items-center">
                                            <SpinnerIcon className="text-blue-500"/>
                                        </div>
                                    ) : (
                                        <>
                                            {student.logoutPending && (
                                                <button
                                                    onClick={() => handleApproveLogout(student.id)}
                                                    className="font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                                                >
                                                    Approve Logout
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleToggleActive(student.id, student.isActive)}
                                                className={`font-medium ${student.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                            >
                                                {student.isActive ? 'Deactivate' : 'Reactivate'}
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};