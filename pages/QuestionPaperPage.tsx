import React, { useState, useEffect, useMemo } from 'react';
import { QuestionPaper } from '../types';
import { listenToQuestionPapers } from '../firebase/services';
import { useAuth } from '../context/AuthContext';
import { SearchIcon, UploadIcon } from '../components/Icons';
import Header from '../components/Header';
import UploadQuestionPaperModal from '../components/UploadQuestionPaperModal';
import ImageViewerModal from '../components/ImageViewerModal';
import { useUI } from '../context/UIContext';

const QuestionPaperPage: React.FC = () => {
    const [allPapers, setAllPapers] = useState<QuestionPaper[]>([]);
    const [loading, setLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState('');
    const [slotFilter, setSlotFilter] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { isAuthenticated } = useAuth();
    const { openLoginModal } = useUI();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = listenToQuestionPapers('approved', (paperData) => {
            setAllPapers(paperData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredPapers = useMemo(() => {
        return allPapers.filter(paper => {
            const lowercasedCourseFilter = courseFilter.toLowerCase();
            const lowercasedSlotFilter = slotFilter.toLowerCase();
            const matchesCourse = courseFilter === '' || paper.courseName.toLowerCase().includes(lowercasedCourseFilter);
            const matchesSlot = slotFilter === '' || paper.slot.toLowerCase().includes(lowercasedSlotFilter);
            return matchesCourse && matchesSlot;
        });
    }, [allPapers, courseFilter, slotFilter]);

    const handleUploadClick = () => {
        if (isAuthenticated) {
            setShowUploadModal(true);
        } else {
            openLoginModal();
        }
    };

    return (
        <div className="bg-vick-light-gray min-h-screen">
            <Header />

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-vick-dark-gray tracking-tight">Question Paper Archive</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-vick-medium-gray">
                        Browse past question papers uploaded by students. Log in to contribute your own.
                    </p>
                </div>

                <div className="mt-10 max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700">Course Name</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SearchIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="course-filter"
                                        placeholder="e.g., Data Structures"
                                        value={courseFilter}
                                        onChange={(e) => setCourseFilter(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                <label htmlFor="slot-filter" className="block text-sm font-medium text-gray-700">Slot</label>
                                <input
                                    type="text"
                                    id="slot-filter"
                                    placeholder="e.g., L1+L2"
                                    value={slotFilter}
                                    onChange={(e) => setSlotFilter(e.target.value)}
                                    className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <button
                                    onClick={handleUploadClick}
                                    className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <UploadIcon className="w-5 h-5" />
                                    Upload Paper
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading question papers...</p>
                    ) : filteredPapers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredPapers.map(paper => (
                                <div key={paper.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                                    <button onClick={() => setSelectedImage(paper.imageUrl)} className="block w-full aspect-[3/4] bg-gray-200">
                                        <img 
                                            src={paper.imageUrl} 
                                            alt={`Question paper for ${paper.courseName}`}
                                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                            loading="lazy"
                                        />
                                    </button>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-800 truncate">{paper.courseName}</h3>
                                        <p className="text-sm text-gray-600">Slot: {paper.slot}</p>
                                        <p className="text-xs text-gray-400 mt-2">Uploaded on {paper.date.toDate().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-10">No question papers found matching your filters.</p>
                    )}
                </div>
            </main>

            {showUploadModal && <UploadQuestionPaperModal onClose={() => setShowUploadModal(false)} />}
            {selectedImage && <ImageViewerModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
};

export default QuestionPaperPage;