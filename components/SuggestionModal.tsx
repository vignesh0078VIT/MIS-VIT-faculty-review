import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CloseIcon } from './Icons';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface SuggestionModalProps {
  onClose: () => void;
  facultyName: string; // To show which faculty the suggestion is for
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ onClose, facultyName }) => {
    const [suggestion, setSuggestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [aiError, setAiError] = useState('');

    const modalRef = useRef<HTMLDivElement>(null);
    useModalAccessibility(modalRef, true, onClose);

    const handleImproveSuggestion = async () => {
        if (!suggestion.trim()) return;
        setIsImproving(true);
        setAiError(''); // Clear previous errors
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const prompt = `Rewrite the following feedback to be more constructive and professional, while retaining the original sentiment. Feedback: "${suggestion}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const improvedText = response.text;
            setSuggestion(improvedText);
        } catch (error) {
            console.error("Error improving suggestion:", error);
            setAiError('Sorry, the AI suggestion failed. Please try again.');
        } finally {
            setIsImproving(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log(`Suggestion for ${facultyName}: ${suggestion}`);
        // Mock submission
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div 
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg m-4 relative"
                role="dialog"
                aria-modal="true"
                aria-labelledby="suggestion-modal-title"
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    aria-label="Close suggestion dialog"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 id="suggestion-modal-title" className="text-2xl font-bold text-gray-800 mb-2">Submit a Suggestion</h2>
                <p className="text-gray-600 mb-6">Your feedback for <span className="font-semibold">{facultyName}</span> helps us improve.</p>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder="Type your suggestion here..."
                        className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                        aria-label="Your suggestion"
                    />
                    {aiError && <p role="alert" className="mt-2 text-sm text-red-600">{aiError}</p>}
                    <div className="mt-4 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleImproveSuggestion}
                            disabled={isImproving || !suggestion.trim()}
                            className="px-4 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            {isImproving ? 'Improving...' : 'Improve with AI ✨'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuggestionModal;
