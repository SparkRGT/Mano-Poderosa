import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-400/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - responsive: full width con margen en móvil */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className={cn(
            'relative w-full max-w-[calc(100vw-1.5rem)] bg-white rounded-lg shadow-xl border border-sky-100 transform transition-all',
            sizes[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-sky-100">
              {title && (
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate min-w-0">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-sky-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 overflow-x-auto">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
