import React, { useState } from 'react';
import { AdminView } from '../../types';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { ReviewModeration } from './ReviewModeration';
import { ApprovedReviews } from './ApprovedReviews';
import { FacultyManagement } from './FacultyManagement';
import { StudentManagement } from './StudentManagement';
import { NewFacultySuggestions } from './NewFacultySuggestions';
import { SiteSettingsControl } from './ChatRoomControl';
import { QuestionPaperModeration } from './QuestionPaperModeration';


export const AdminPanel: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('pending-reviews');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'pending-reviews':
        return <ReviewModeration />;
      case 'approved-reviews':
        return <ApprovedReviews />;
      case 'new-faculty-suggestions':
        return <NewFacultySuggestions />;
      case 'faculty-management':
        return <FacultyManagement />;
      case 'student-management':
        return <StudentManagement />;
      case 'pending-question-papers':
        return <QuestionPaperModeration />;
      case 'site-settings':
        return <SiteSettingsControl />;
      default:
        return <ReviewModeration />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};
