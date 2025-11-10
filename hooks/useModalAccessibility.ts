import React, { useEffect, useRef } from 'react';

/**
 * A custom hook to manage accessibility for modal dialogs.
 * It handles focus trapping, closing the modal with the Escape key,
 * and returning focus to the element that opened the modal.
 *
 * @param modalRef Ref to the modal container element.
 * @param isOpen State of whether the modal is open.
 * @param onClose Function to call to close the modal.
 */
export const useModalAccessibility = (
  modalRef: React.RefObject<HTMLDivElement>,
  isOpen: boolean,
  onClose: () => void
) => {
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save the element that had focus before the modal opened
      openerRef.current = document.activeElement as HTMLElement;

      // Focus the first focusable element in the modal
      setTimeout(() => {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }, 100); // Timeout ensures elements are rendered

      const handleKeyDown = (event: KeyboardEvent) => {
        // Close on Escape
        if (event.key === 'Escape') {
          onClose();
          return;
        }

        // Trap focus
        if (event.key === 'Tab') {
          const focusableElements = Array.from(
            modalRef.current?.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) || []
          ).filter(el => el.offsetParent !== null); // Ensure element is visible

          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              firstElement.focus();
              event.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Return focus to the opener element
        if (openerRef.current) {
          openerRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose, modalRef]);
};
