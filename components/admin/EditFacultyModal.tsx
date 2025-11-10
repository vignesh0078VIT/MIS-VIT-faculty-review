import React, { useState, useRef, useEffect } from 'react';
import { Faculty } from '../../types';
import { updateFaculty, uploadFacultyAvatar } from '../../firebase/services';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { CloseIcon, SpinnerIcon } from '../Icons';

interface EditFacultyModalProps {
  faculty: Faculty;
  onClose: () => void;
  onSave: (updatedFaculty: Faculty) => void;
}

const EditFacultyModal: React.FC<EditFacultyModalProps> = ({ faculty, onClose, onSave }) => {
  const [name, setName] = useState(faculty.name);
  const [department, setDepartment] = useState(faculty.department);
  const [title, setTitle] = useState(faculty.title);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(faculty.avatarUrl);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useModalAccessibility(modalRef, true, onClose);

  useEffect(() => {
    // Create a preview URL for the selected file
    if (avatarFile) {
        const objectUrl = URL.createObjectURL(avatarFile);
        setAvatarPreview(objectUrl);
        // Free memory when the component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }
  }, [avatarFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const generateNewAvatar = () => {
    const newAvatarUrl = `https://api.dicebear.com/8.x/micah/svg?seed=${name.replace(/\s/g, '')}`;
    setAvatarPreview(newAvatarUrl);
    setAvatarFile(null); // Clear any selected file
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !department.trim() || !title.trim()) {
      setError('All text fields are required.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let newAvatarUrl = avatarPreview; // Start with current preview
      
      // If a new file was selected, upload it
      if (avatarFile) {
        newAvatarUrl = await uploadFacultyAvatar(faculty.id, avatarFile);
      }
      
      const updatedData: Partial<Faculty> = {
        name,
        department,
        title,
        avatarUrl: newAvatarUrl,
      };

      await updateFaculty(faculty.id, updatedData);
      
      // Create the full updated faculty object to pass back
      const updatedFaculty: Faculty = { ...faculty, ...updatedData };
      onSave(updatedFaculty);

    } catch (err) {
      setError('Failed to save changes. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl m-4 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-faculty-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close edit faculty dialog"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 id="edit-faculty-modal-title" className="text-2xl font-bold text-gray-800 mb-6">
          Edit Faculty Profile
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side: Avatar */}
            <div className="md:col-span-1 flex flex-col items-center">
                <img src={avatarPreview} alt="Avatar Preview" className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-gray-200" />
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mb-2 px-4 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                    Change Picture
                </button>
                <button
                    type="button"
                    onClick={generateNewAvatar}
                    className="w-full px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                    Generate New Avatar
                </button>
            </div>
            {/* Right side: Details */}
            <div className="md:col-span-2 space-y-4">
                <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" id="edit-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">Department</label>
                    <input type="text" id="edit-department" value={department} onChange={e => setDepartment(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="edit-title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Professor" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                 {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
                <div className="pt-2 flex justify-end">
                    <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
                    >
                    {isSaving && <SpinnerIcon className="w-5 h-5 mr-2" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditFacultyModal;