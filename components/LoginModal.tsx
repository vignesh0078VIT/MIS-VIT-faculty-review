import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CloseIcon, SpinnerIcon, UserCircleIcon } from './Icons';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { useUI } from '../context/UIContext';

const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal } = useUI();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { studentLogin, studentRegister } = useAuth();

  const modalRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(modalRef, isLoginModalOpen, closeLoginModal);
  
  if (!isLoginModalOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lowercasedEmail = email.trim().toLowerCase();

    if (!lowercasedEmail.endsWith('@vitstudent.ac.in')) {
      setError('Please use a valid VIT student email (@vitstudent.ac.in)');
      return;
    }

    if (isRegister) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    
    setLoading(true);

    if (isRegister) {
      const { success, message } = await studentRegister(email, password);
      if (success) {
        closeLoginModal();
      } else {
        setError(message);
      }
    } else {
      const { success, message } = await studentLogin(email, password);
      if (success) {
        closeLoginModal();
      } else {
        setError(message);
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
      setIsRegister(!isRegister);
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button 
            onClick={closeLoginModal} 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            aria-label="Close login dialog"
        >
            <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
            <UserCircleIcon className="w-12 h-12 mx-auto text-blue-500" />
            <h2 id="modal-title" className="text-2xl font-bold text-gray-800 mt-4 mb-2">{isRegister ? 'Student Registration' : 'Student Login'}</h2>
            <p className="text-gray-600">{isRegister ? 'Create an account to leave reviews.' : 'Enter your VIT student credentials.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="regno@vitstudent.ac.in"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                placeholder="••••••••"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
              />
            </div>
          </div>
          {isRegister && (
             <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
                </label>
                <div className="mt-1">
                <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                />
                </div>
            </div>
          )}
          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? <><SpinnerIcon className="w-5 h-5 mr-2" /> Processing...</> : (isRegister ? 'Register' : 'Login')}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
            <button onClick={toggleMode} className="text-sm text-blue-600 hover:underline">
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
        </div>

      </div>
    </div>
  );
};

export default LoginModal;