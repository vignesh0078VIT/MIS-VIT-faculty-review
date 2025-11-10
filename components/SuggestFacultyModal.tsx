import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { addNewFacultySuggestion } from '../firebase/services';
import { CloseIcon, SpinnerIcon, UserPlusIcon } from './Icons';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface SuggestFacultyModalProps {
  onClose: () => void;
}

const SuggestFacultyModal: React.FC<SuggestFacultyModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [facultyName, setFacultyName] = useState('');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(modalRef, true, onClose);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyName.trim() || !department.trim()) {
      setError('Faculty name and department are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (!user) throw new Error("User not found");
      await addNewFacultySuggestion({
        userId: user.id,
        facultyName,
        department,
        title,
        notes,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to submit suggestion. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg m-4 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggest-faculty-modal-title"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close suggest faculty dialog"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        
        {success ? (
          <div role="alert" className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-800">Thank You!</h2>
              <p className="text-gray-600 mt-2">Your suggestion has been sent to the admin for review.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
                <UserPlusIcon className="w-12 h-12 mx-auto text-blue-500" />
                <h2 id="suggest-faculty-modal-title" className="text-2xl font-bold text-gray-800 mt-4 mb-2">Suggest New Faculty</h2>
                <p className="text-gray-600">Help us keep our faculty list up-to-date.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="facultyName" className="block text-sm font-medium text-gray-700">Faculty Full Name</label>
                <input
                  type="text"
                  id="facultyName"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title / Designation (Optional)</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Assistant Professor, HOD"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g., Joined in Fall 2024"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {submitting ? <><SpinnerIcon className="w-5 h-5 mr-2" /> Submitting...</> : 'Submit for Review'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SuggestFacultyModal;
