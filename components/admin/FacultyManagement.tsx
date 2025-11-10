import React, { useState, useEffect, useRef } from 'react';
import { Faculty } from '../../types';
import { listenToAllFaculty, addFaculty, deleteFaculty, addFacultyBulk, updateFaculty } from '../../firebase/services';
import { SpinnerIcon, TrashIcon, UserPlusIcon, PencilIcon } from '../Icons';
import EditFacultyModal from './EditFacultyModal';

export const FacultyManagement: React.FC = () => {
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    
    // Form state
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // State for CSV import
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [importSuccess, setImportSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = listenToAllFaculty((faculties) => {
            setFacultyList(faculties);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    const handleDelete = async (facultyId: string) => {
        if (window.confirm('Are you sure you want to delete this faculty member? This action cannot be undone.')) {
            await deleteFaculty(facultyId);
            showSuccessMessage('Faculty member deleted.');
            // UI will update via listener
        }
    };

    const handleAddFaculty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !department.trim() || !title.trim()) {
            setError('All fields are required.');
            return;
        }
        setError('');
        setIsAdding(true);
        try {
            await addFaculty({ name, department, title });
            // Clear form and show success message
            setName('');
            setDepartment('');
            setTitle('');
            showSuccessMessage(`Successfully added ${name}.`);
        } catch (err) {
            setError('Failed to add faculty.');
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportError('');
        setImportSuccess('');

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) {
                    throw new Error("File is empty or could not be read.");
                }

                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length <= 1) {
                    throw new Error("CSV file must contain a header row and at least one data row.");
                }
                
                const headerLine = lines.shift()?.toLowerCase();
                if (!headerLine?.includes('name') || !headerLine?.includes('department') || !headerLine?.includes('title')) {
                     throw new Error("CSV must contain 'name', 'department', and 'title' columns in the header.");
                }

                const facultyDataArray = lines.map(line => {
                    const [name, department, title] = line.split(',').map(v => v.trim());
                    if (name && department && title) {
                        return { name, department, title };
                    }
                    return null;
                }).filter((item): item is { name: string; department: string; title: string } => item !== null);

                if (facultyDataArray.length === 0) {
                    throw new Error("No valid faculty data found in the CSV file.");
                }

                await addFacultyBulk(facultyDataArray);
                setImportSuccess(`Successfully imported ${facultyDataArray.length} faculty members.`);
                
                setTimeout(() => setImportSuccess(''), 5000);

            } catch (err: any) {
                setImportError(err.message || 'An error occurred during import.');
            } finally {
                setIsImporting(false);
                if(fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };

        reader.onerror = () => {
            setImportError('Failed to read the file.');
            setIsImporting(false);
             if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    const handleSave = (updatedFaculty: Faculty) => {
        // Listener will update the list, but we can do it optimistically too.
        setFacultyList(prevList => prevList.map(f => f.id === updatedFaculty.id ? updatedFaculty : f));
        setEditingFaculty(null);
        showSuccessMessage(`Successfully updated ${updatedFaculty.name}.`);
    };


    if (loading) {
        return <div className="p-8">Loading faculty...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 flex-1 h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Faculty Management</h1>
            
             {successMessage && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{successMessage}</span>
                </div>
            )}

            {/* Add New Faculty Form */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Faculty</h2>
                <form onSubmit={handleAddFaculty} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                        <input type="text" id="department" value={department} onChange={e => setDepartment(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Professor" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <button type="submit" disabled={isAdding} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                        {isAdding ? <SpinnerIcon /> : <><UserPlusIcon className="w-5 h-5 mr-2"/> Add Faculty</>}
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {/* CSV Import Section */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800">Bulk Import</h2>
                <p className="text-gray-600 mt-1">Upload a CSV file with columns: <code>name</code>, <code>department</code>, <code>title</code> to add multiple faculty at once. The first row must be the header.</p>
                <div className="mt-4">
                    <label htmlFor="csv-upload" className={`inline-flex items-center cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isImporting ? 'bg-gray-400' : 'bg-vick-green hover:bg-green-700'}`}>
                        {isImporting ? <><SpinnerIcon className="w-5 h-5 mr-2" /> Importing...</> : 'Choose CSV File'}
                    </label>
                    <input id="csv-upload" type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={isImporting} />
                    {importSuccess && <p className="text-green-600 text-sm mt-2">{importSuccess}</p>}
                    {importError && <p className="text-red-500 text-sm mt-2">{importError}</p>}
                </div>
            </div>

            {/* Faculty List */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Department</th>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facultyList.map((faculty) => (
                            <tr key={faculty.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                    <img src={faculty.avatarUrl} alt={faculty.name} className="w-10 h-10 rounded-full object-cover"/>
                                    {faculty.name}
                                </td>
                                <td className="px-6 py-4">{faculty.department}</td>
                                <td className="px-6 py-4">{faculty.title}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button
                                            onClick={() => setEditingFaculty(faculty)}
                                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full"
                                            aria-label="Edit faculty"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(faculty.id)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full"
                                            aria-label="Delete faculty"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingFaculty && (
                <EditFacultyModal 
                    faculty={editingFaculty} 
                    onClose={() => setEditingFaculty(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};