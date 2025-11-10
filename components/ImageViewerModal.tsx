import React, { useRef } from 'react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { CloseIcon } from './Icons';

interface ImageViewerModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(modalRef, true, onClose);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
        aria-label="Close image viewer"
      >
        <CloseIcon className="w-8 h-8" />
      </button>
      <div className="max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Question paper full view"
          className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  );
};

export default ImageViewerModal;