import React from 'react';
import { Faculty } from '../types';
import { StarIcon } from './Icons';

interface FacultyCardProps {
  faculty: Faculty;
  onSelect: (faculty: Faculty) => void;
}

const FacultyCard: React.FC<FacultyCardProps> = ({ faculty, onSelect }) => {
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden text-center p-6 transition-transform transform hover:-translate-y-2 cursor-pointer"
      onClick={() => onSelect(faculty)}
    >
      <img className="w-32 h-32 rounded-full mx-auto object-cover" src={faculty.avatarUrl} alt={`Portrait of ${faculty.name}`} />
      <h3 className="text-xl font-bold text-gray-800 mt-4">{faculty.name}</h3>
      <p className="text-gray-600 mt-1">{faculty.department}, {faculty.title}</p>
      <div className="flex items-center justify-center mt-3 text-gray-700">
        <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
        <span className="font-bold">{faculty.rating.toFixed(1)}</span>
        <span className="text-gray-500 ml-1">({faculty.reviewCount} reviews)</span>
      </div>
    </div>
  );
};

interface FacultyListProps {
  faculties: Faculty[];
  onFacultySelect: (faculty: Faculty) => void;
}

const FacultyList: React.FC<FacultyListProps> = ({ faculties, onFacultySelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {faculties.map((faculty) => (
        <FacultyCard key={faculty.id} faculty={faculty} onSelect={onFacultySelect} />
      ))}
    </div>
  );
};

export default FacultyList;