import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true, 
  closeOnOverlayClick = true 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        <div className="flex justify-between items-center border-b pb-3">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-800">{title}</h2>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};