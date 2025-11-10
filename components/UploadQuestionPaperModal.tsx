import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAuth } from '../context/AuthContext';
import { addQuestionPaper, uploadQuestionPaperImage } from '../firebase/services';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { CloseIcon, SpinnerIcon, UploadIcon } from './Icons';

interface UploadQuestionPaperModalProps {
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error('Failed to read file as data URL.'));
        }
    };
    reader.onerror = (error) => reject(error);
  });
};


const UploadQuestionPaperModal: React.FC<UploadQuestionPaperModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [courseName, setCourseName] = useState('');
  const [slot, setSlot] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useModalAccessibility(modalRef, true, onClose);

  useEffect(() => {
    const apiKeyIsMissing = !process.env.API_KEY || process.env.API_KEY.startsWith("REPLACE_WITH");
    if (apiKeyIsMissing) {
        setIsApiKeyMissing(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) { // 3MB limit
        setError('Image size is too large (must be < 3MB). Please compress it and try again.');
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setAiError('');
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!imageFile) {
        setAiError('Please select an image first.');
        return;
    }
    setIsAnalyzing(true);
    setAiError('');

    try {
        const base64Data = await fileToBase64(imageFile);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        const imagePart = {
            inlineData: {
                mimeType: imageFile.type,
                data: base64Data,
            },
        };

        const textPart = {
            text: 'From the attached image of a university question paper, extract the course name/title and the course slot/code. Provide the response as a JSON object with keys "courseName" and "slot". If a piece of information is not found, return an empty string for that key.'
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        courseName: { type: Type.STRING, description: 'The full name or title of the course.' },
                        slot: { type: Type.STRING, description: 'The slot code for the course, e.g., L31+L32.' },
                    },
                    required: ['courseName', 'slot']
                },
            },
        });

        const result = JSON.parse(response.text);
        if (result.courseName) setCourseName(result.courseName);
        if (result.slot) setSlot(result.slot);

    } catch (error) {
        console.error("Error analyzing with AI:", error);
        setAiError('AI analysis failed. Please enter the details manually.');
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !slot.trim() || !imageFile) {
      setError('All fields and an image are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (!user) throw new Error("User not found");

      const imageUrl = await uploadQuestionPaperImage(imageFile, user.id);

      await addQuestionPaper({
        userId: user.id,
        userEmail: user.email!,
        courseName,
        slot,
        imageUrl,
      });

      setSuccess(true);
      setTimeout(() => onClose(), 2000);

    } catch (err) {
      setError('Failed to upload question paper. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close upload dialog"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        
        {success ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800">Upload Successful!</h2>
            <p className="text-gray-600 mt-2">Your question paper has been submitted for admin review.</p>
          </div>
        ) : (
          <>
            <h2 id="upload-modal-title" className="text-2xl font-bold text-gray-800 mb-2">Upload Question Paper</h2>
            <p className="text-lg font-bold text-red-600 text-center mb-4">
                Note: Image size must be less than 3MB.
            </p>
             <p className="text-sm text-gray-500 text-center mb-4">
                Upload an image and use our AI assistant to automatically fill in the details.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Image File</label>
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileChange({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                >
                  <div className="space-y-1 text-center">
                    {preview ? (
                      <img src={preview} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                    ) : (
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <p className="pl-1">{imageFile ? imageFile.name : 'Click to upload or drag and drop'}</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 3MB</p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                 <button
                    type="button"
                    onClick={handleAnalyzeWithAI}
                    disabled={isApiKeyMissing || !imageFile || isAnalyzing || submitting}
                    title={isApiKeyMissing ? "AI feature is disabled because API key is not configured." : "Fill Details with AI"}
                    className="w-full flex justify-center items-center gap-2 mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-vick-accent-violet hover:bg-purple-700 disabled:bg-gray-400"
                >
                    {isAnalyzing ? <SpinnerIcon className="w-5 h-5" /> : '✨'}
                    {isAnalyzing ? 'Analyzing...' : 'Fill Details with AI'}
                </button>
                {aiError && <p role="alert" className="text-sm text-red-600 mt-2">{aiError}</p>}
              </div>
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">Course Name</label>
                <input
                  type="text"
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="slot" className="block text-sm font-medium text-gray-700">Slot</label>
                <input
                  type="text"
                  id="slot"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  placeholder="e.g., L31+L32"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {submitting ? <SpinnerIcon /> : <UploadIcon className="w-5 h-5" />}
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadQuestionPaperModal;