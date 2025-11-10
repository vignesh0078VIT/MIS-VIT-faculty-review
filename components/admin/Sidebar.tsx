import React from 'react';
import { AdminView } from '../../types';
import { 
    VickIcon,
    PendingReviewsIcon, 
    ApprovedReviewsIcon, 
    FacultyManagementIcon, 
    StudentManagementIcon,
    UserPlusIcon,
    LogoutIcon,
    CogIcon,
    DocumentIcon
} from '../Icons';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;
}

const navItems = [
    { view: 'pending-reviews', label: 'Pending Reviews', icon: PendingReviewsIcon },
    { view: 'approved-reviews', label: 'Approved Reviews', icon: ApprovedReviewsIcon },
    { view: 'new-faculty-suggestions', label: 'New Faculty Suggestions', icon: UserPlusIcon },
    { view: 'pending-question-papers', label: 'Question Papers', icon: DocumentIcon },
    { view: 'faculty-management', label: 'Faculty Management', icon: FacultyManagementIcon },
    { view: 'student-management', label: 'Student Management', icon: StudentManagementIcon },
    { view: 'site-settings', label: 'Site Settings', icon: CogIcon },
] as const;


export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    const { logout, user } = useAuth();
  
    return (
        <aside className="w-64 bg-white text-gray-800 flex flex-col border-r border-gray-200 shrink-0">
            <div className="p-4 flex items-center gap-3 border-b border-gray-200">
                <VickIcon className="w-10 h-10" />
                <div>
                    <h2 className="text-base font-bold text-gray-800">VICK VIT MIS Reviews</h2>
                    <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map(({ view, label, icon: Icon }) => (
                    <button
                        key={view}
                        onClick={() => setCurrentView(view)}
                        className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                            ${currentView === view
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Icon className="w-5 h-5 mr-3" />
                        <span>{label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={logout}
                    className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <LogoutIcon className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};