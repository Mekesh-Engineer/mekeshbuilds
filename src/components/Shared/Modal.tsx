// src/components/Shared/Modal.tsx
// Accessible modal dialog with backdrop click and Escape key close.
import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <dialog
            ref={dialogRef}
            className={`${sizeClasses[size]} w-full rounded-2xl border border-sys-border bg-sys-bg-secondary p-0 text-sys-text-primary backdrop:bg-black/60`}
            onClick={(e) => {
                if (e.target === dialogRef.current) onClose();
            }}
        >
            <div className="p-6">
                {title && (
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-sys-text-secondary transition-colors hover:bg-sys-bg-tertiary hover:text-sys-text-primary"
                            aria-label="Close modal"
                        >
                            <span className="material-icons-round text-xl">close</span>
                        </button>
                    </div>
                )}
                {children}
            </div>
        </dialog>
    );
};
