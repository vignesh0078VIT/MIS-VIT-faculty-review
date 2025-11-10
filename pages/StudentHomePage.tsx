import React, { useState, useEffect, useMemo } from 'react';
import { Faculty } from '../types';
import { listenToAllFaculty } from '../firebase/services';
import FacultyList from '../components/FacultyList';
import FacultyDetail from '../components/FacultyDetail';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';
import SuggestFacultyModal from '../components/SuggestFacultyModal';
import { SearchIcon } from '../components/Icons';
import ChatRoomModal from '../components/ChatRoomModal';

const StudentHomePage: React.FC = () => {
    const [allFaculties, setAllFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
    const [showSuggestFacultyModal, setShowSuggestFacultyModal] = useState(false);
    const [showChatRoom, setShowChatRoom] = useState(false);
    
    // State for all filters
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTag, setActiveTag] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [titleFilter, setTitleFilter] = useState('All');

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        setLoading(true);
        const unsubscribeFaculty = listenToAllFaculty((facultyData) => {
            setAllFaculties(facultyData);
            setLoading(false);
        });

        return () => {
            unsubscribeFaculty();
        };
    }, []);

    const handleSelectFaculty = (faculty: Faculty) => {
        setSelectedFaculty(faculty);
        window.scrollTo(0, 0);
    };

    const handleBackToList = () => {
        setSelectedFaculty(null);
    };
    
    const uniqueDepartments = useMemo(() => {
        const departments = new Set(allFaculties.map(f => f.department));
        return ['All', ...Array.from(departments).sort()];
    }, [allFaculties]);

    const uniqueTitles = useMemo(() => {
        const titles = new Set(allFaculties.map(f => f.title));
        return ['All', ...Array.from(titles).sort()];
    }, [allFaculties]);

    const filteredFaculties = useMemo(() => {
        return allFaculties.filter(faculty => {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                faculty.name.toLowerCase().includes(lowercasedSearchTerm) ||
                faculty.department.toLowerCase().includes(lowercasedSearchTerm);
            
            const matchesTag = activeTag === 'All' || faculty.tags.includes(activeTag);
            const matchesDepartment = departmentFilter === 'All' || faculty.department === departmentFilter;
            const matchesTitle = titleFilter === 'All' || faculty.title === titleFilter;

            return matchesSearch && matchesTag && matchesDepartment && matchesTitle;
        });
    }, [allFaculties, searchTerm, activeTag, departmentFilter, titleFilter]);

    const filterTags = ['All', 'Helpful', 'Strict', 'Project-Heavy', 'Good Grader', 'Lenient'];

    return (
        <div className="bg-vick-light-gray min-h-screen">
            <Header onChatClick={() => setShowChatRoom(true)} />
            
            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                {selectedFaculty ? (
                    <FacultyDetail faculty={selectedFaculty} onBack={handleBackToList} />
                ) : (
                    <>
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-vick-dark-gray tracking-tight">Chat Room &amp; AI-Powered Uploads</h2>
                            <p className="mt-4 text-lg text-vick-medium-gray">
                                Join the live student chat room to connect with peers. Use our new AI assistant to automatically extract details when you upload question papers.
                            </p>
                        </div>
                        
                        {/* Filter & Suggestion Area */}
                        <div className="mt-8 max-w-4xl mx-auto">
                             {isAuthenticated && (
                                <div className="flex justify-center mb-6">
                                     <button
                                       onClick={() => setShowSuggestFacultyModal(true)}
                                       className="px-5 py-2 font-medium text-sm rounded-full transition-colors bg-vick-green text-white hover:bg-green-700 shadow"
                                     >
                                       Suggest New Faculty
                                     </button>
                                </div>
                            )}

                            {/* Filter Controls */}
                            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <SearchIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name or department..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select
                                            id="department-filter"
                                            value={departmentFilter}
                                            onChange={(e) => setDepartmentFilter(e.target.value)}
                                            className="w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {uniqueDepartments.map(dept => (
                                                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="title-filter" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <select
                                            id="title-filter"
                                            value={titleFilter}
                                            onChange={(e) => setTitleFilter(e.target.value)}
                                            className="w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {uniqueTitles.map(title => (
                                                <option key={title} value={title}>{title === 'All' ? 'All Titles' : title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex justify-center flex-wrap gap-3">
                                    {filterTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setActiveTag(tag)}
                                            className={`px-5 py-2 font-medium text-sm rounded-full transition-colors ${
                                                activeTag === tag 
                                                ? 'bg-blue-600 text-white shadow' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>


                        <div className="mt-16">
                            {loading ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Loading faculty...</p>
                                </div>
                            ) : (
                                <FacultyList faculties={filteredFaculties} onFacultySelect={handleSelectFaculty} />
                            )}
                        </div>
                    </>
                )}
            </main>
            
            {showSuggestFacultyModal && <SuggestFacultyModal onClose={() => setShowSuggestFacultyModal(false)} />}
            {showChatRoom && <ChatRoomModal onClose={() => setShowChatRoom(false)} />}
            <Chatbot />
        </div>
    );
};

export default StudentHomePage;