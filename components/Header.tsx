import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useUI } from '../context/UIContext';
import { BookIcon, CloseIcon, MenuIcon, ChatBubbleIcon } from './Icons';

interface HeaderProps {
    onChatClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onChatClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, requestLogout } = useAuth();
    const { settings: siteSettings } = useSiteSettings();
    const { openLoginModal } = useUI();

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const handleLogoutRequest = () => {
        if (confirm('Are you sure you want to request to log out? This action requires admin approval.')) {
            requestLogout();
        }
    };
    
    const navLinkClass = ({ isActive }: { isActive: boolean }) => 
        `font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`;
    
    const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-2xl font-semibold ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`;

    return (
        <>
            <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <BookIcon className="w-8 h-8 text-blue-600" />
                        <h1 className="text-lg font-bold text-gray-800">VICK VIT MIS REVIEWS</h1>
                    </Link>
                    
                    <nav className="hidden md:flex items-center space-x-8">
                        <NavLink to="/" className={navLinkClass}>Home</NavLink>
                        <NavLink to="/question-papers" className={navLinkClass}>Question Papers</NavLink>
                        {siteSettings?.isAboutPageEnabled && <NavLink to="/about" className={navLinkClass}>About</NavLink>}
                    </nav>

                    <div className="flex items-center space-x-4">
                         {siteSettings?.isChatEnabled && onChatClick && (
                             <button
                                onClick={onChatClick}
                                className="px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-vick-accent-violet hover:bg-purple-700 flex items-center gap-2 animate-pulse"
                                title="Open Student Chat Room"
                            >
                                <ChatBubbleIcon className="w-5 h-5"/>
                                <span className="hidden sm:inline">Chat Room</span>
                            </button>
                        )}
                        {isAuthenticated && user?.role === 'student' ? (
                            <>
                                <span className="text-sm text-gray-700 hidden sm:block">Welcome, {user.email}!</span>
                                <button
                                    onClick={handleLogoutRequest}
                                    disabled={user.logoutPending}
                                    className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-vick-red hover:bg-red-700 disabled:bg-yellow-400 disabled:text-gray-800 disabled:cursor-not-allowed"
                                >
                                    {user.logoutPending ? 'Logout Pending' : 'Request Logout'}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/admin/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors hidden sm:block">
                                   Admin Login
                                </Link>
                                <button
                                    onClick={openLoginModal}
                                    className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Student Login
                                </button>
                            </>
                        )}
                        
                        <div className="md:hidden">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                                className="text-gray-700"
                                aria-label="Open navigation menu"
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-menu"
                            >
                               {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div 
                id="mobile-menu"
                className={`fixed inset-0 z-30 bg-white transition-transform transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}
            >
                <div className="flex flex-col items-center justify-center h-full">
                    <nav className="flex flex-col items-center space-y-8 text-center">
                        <NavLink to="/" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                        <NavLink to="/question-papers" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Question Papers</NavLink>
                        {siteSettings?.isAboutPageEnabled && <NavLink to="/about" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>About</NavLink>}
                        {!isAuthenticated && (
                            <Link to="/admin/login" className="text-2xl text-gray-700 hover:text-blue-600 font-semibold sm:hidden" onClick={() => setIsMenuOpen(false)}>
                                Admin Login
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Header;