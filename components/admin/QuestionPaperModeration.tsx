import React, { useState, useEffect } from 'react';
import { QuestionPaper } from '../../types';
import { listenToQuestionPapers, updateQuestionPaperStatus } from '../../firebase/services';
import { CheckIcon, TrashIcon } from '../Icons';

export const QuestionPaperModeration: React.FC = () => {
    const [pendingPapers, setPendingPapers] = useState<QuestionPaper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = listenToQuestionPapers('pending', (papers) => {
            setPendingPapers(papers);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAction = async (paperId: string, action: 'approved' | 'rejected') => {
        await updateQuestionPaperStatus(paperId, action);
        // Real-time listener will automatically update the UI
    };

    if (loading) {
        return <div className="p-8">Loading pending question papers...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 flex-1 h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Question Paper Moderation</h1>
            
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                {pendingPapers.length === 0 ? (
                     <div className="p-8 text-center">
                        <p className="text-gray-500">No pending question papers to review.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Course Name</th>
                                <th scope="col" className="px-6 py-3">Slot</th>
                                <th scope="col" className="px-6 py-3">Submitted By</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Preview</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingPapers.map((paper) => (
                                <tr key={paper.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{paper.courseName}</td>
                                    <td className="px-6 py-4">{paper.slot}</td>
                                    <td className="px-6 py-4">{paper.userEmail}</td>
                                    <td className="px-6 py-4">{paper.date.toDate().toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <a href={paper.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            View Image
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button 
                                                onClick={() => handleAction(paper.id, 'approved')}
                                                className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-green-600"
                                                aria-label="Approve"
                                            >
                                                <CheckIcon className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(paper.id, 'rejected')}
                                                className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-600"
                                                aria-label="Reject"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
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