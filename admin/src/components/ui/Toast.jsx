import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-surface border border-border shadow-lg rounded-lg p-4 animate-in slide-in-from-bottom-5">
            {type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
                <XCircle className="w-5 h-5 text-red-500" />
            )}
            <p className="text-text font-medium text-sm">{message}</p>
            <button onClick={onClose} className="ml-4 text-muted hover:text-text transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
