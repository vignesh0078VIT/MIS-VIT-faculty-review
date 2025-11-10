import React, { useState, useEffect } from 'react';
import { NewFacultySuggestion } from '../../types';
import { listenToNewFacultySuggestions, updateNewFacultySuggestionStatus, getUserData } from '../../firebase/services';
import { CheckIcon, TrashIcon } from '../Icons';

interface EnrichedSuggestion extends NewFacultySuggestion {
    userEmail: string;
}

export const NewFacultySuggestions: React.FC = () => {
    const [suggestions, setSuggestions] = useState<EnrichedSuggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = listenToNewFacultySuggestions('pending', async (suggestionsData) => {
            const enrichedSuggestions = await Promise.all(
                suggestionsData.map(async (suggestion) => {
                    const user = await getUserData(suggestion.userId);
                    return {
                        ...suggestion,
                        userEmail: user?.email || 'Unknown User',
                    };
                })
            );
            setSuggestions(enrichedSuggestions.sort((a,b) => b.date.toMillis() - a.date.toMillis()));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAction = async (suggestionId: string, action: 'approved' | 'rejected') => {
        await updateNewFacultySuggestionStatus(suggestionId, action);
        // UI will update via listener
    };

    if (loading) {
        return <div className="p-8">Loading suggestions...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 flex-1 h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">New Faculty Suggestions</h1>
            
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                {suggestions.length === 0 ? (
                     <div className="p-8 text-center">
                        <p className="text-gray-500">No pending new faculty suggestions.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Faculty Name</th>
                                <th scope="col" className="px-6 py-3">Department</th>
                                <th scope="col" className="px-6 py-3">Title</th>
                                <th scope="col" className="px-6 py-3">Notes</th>
                                <th scope="col" className="px-6 py-3">Suggested By</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.map((suggestion) => (
                                <tr key={suggestion.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{suggestion.facultyName}</td>
                                    <td className="px-6 py-4">{suggestion.department}</td>
                                    <td className="px-6 py-4">{suggestion.title || 'N/A'}</td>
                                    <td className="px-6 py-4 max-w-xs truncate">{suggestion.notes || 'N/A'}</td>
                                    <td className="px-6 py-4">{suggestion.userEmail}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button 
                                                onClick={() => handleAction(suggestion.id, 'approved')}
                                                className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-green-600"
                                                aria-label="Approve"
                                            >
                                                <CheckIcon className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(suggestion.id, 'rejected')}
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