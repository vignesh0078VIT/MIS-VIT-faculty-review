import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import { UIProvider } from './context/UIContext';
import StudentHomePage from './pages/StudentHomePage';
import AdminLoginPage from './components/admin/AdminLoginPage';
import { AdminPanel } from './components/admin/AdminPanel';
import AboutPage from './pages/AboutPage';
import { isConfigured } from './firebase/config';
import QuestionPaperPage from './pages/QuestionPaperPage';
import LoginModal from './components/LoginModal';

const FirebaseConfigErrorOverlay: React.FC = () => (
    <div style={{ padding: '2rem', fontFamily: 'monospace', backgroundColor: '#282c34', color: 'white', minHeight: '100vh', lineHeight: '1.6' }}>
        <h1 style={{ fontSize: '2rem', color: '#ff4d4f', borderBottom: '2px solid #ff4d4f', paddingBottom: '0.5rem' }}>
            Firebase Configuration Error
        </h1>
        <p style={{ marginTop: '1.5rem', fontSize: '1.1rem' }}>
            Your application is not connected to a Firebase project because the configuration is missing or invalid.
        </p>
        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', color: '#f0ad4e' }}>
            ACTION REQUIRED
        </h2>
        <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
            Please open the file <code style={{ backgroundColor: '#444', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>firebase/config.ts</code> and replace the placeholder values with your actual Firebase project credentials.
        </p>
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#333', borderRadius: '8px', border: '1px solid #555' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>How to get your Firebase config:</h3>
            <ol style={{ paddingLeft: '2rem', listStyleType: 'decimal' }}>
                <li style={{ marginBottom: '0.5rem' }}>Go to the Firebase console: <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#61dafb' }}>console.firebase.google.com</a></li>
                <li style={{ marginBottom: '0.5rem' }}>Select your project (or create a new one).</li>
                <li style={{ marginBottom: '0.5rem' }}>Click the gear icon (Project settings) in the top-left corner.</li>
                <li style={{ marginBottom: '0.5rem' }}>In the "General" tab, scroll down to the "Your apps" section.</li>
                <li style={{ marginBottom: '0.5rem' }}>Find your web app and copy the `firebaseConfig` object.</li>
                <li style={{ marginBottom: '0.5rem' }}>Paste the values into the `firebaseConfig` object in <code style={{ backgroundColor: '#444', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>firebase/config.ts</code>.</li>
            </ol>
        </div>
        <p style={{ marginTop: '2rem', color: '#999' }}>
            The application will not work until this is completed.
        </p>
    </div>
);


const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return children;
};

const AppRoutes: React.FC = () => {
    const { settings, loading } = useSiteSettings();

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading settings...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={<StudentHomePage />} />
            <Route 
                path="/about" 
                element={settings?.isAboutPageEnabled ? <AboutPage /> : <Navigate to="/" />} 
            />
            <Route path="/question-papers" element={<QuestionPaperPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route 
            path="/admin/*" 
            element={
                <AdminRoute>
                <AdminPanel />
                </AdminRoute>
            } 
            />
        </Routes>
    );
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
      <LoginModal />
    </Router>
  );
};

const App: React.FC = () => {
  if (!isConfigured) {
    return <FirebaseConfigErrorOverlay />;
  }

  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <UIProvider>
            <AppContent />
        </UIProvider>
      </SiteSettingsProvider>
    </AuthProvider>
  );
};

export default App;