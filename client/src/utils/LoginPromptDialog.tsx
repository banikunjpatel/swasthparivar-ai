// src/components/Common/LoginPromptDialog.tsx

import React from 'react';

interface LoginPromptDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    onClose: () => void;
}

const LoginPromptDialog: React.FC<LoginPromptDialogProps> = ({
    open,
    title = 'Please sign in first',
    description = 'You need to be signed in to access this feature.',
    onClose,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
                <p className="text-sm text-gray-600 mb-4">{description}</p>
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
                >
                    Sign In
                </button>
                <button
                    className="text-gray-500 text-sm underline"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default LoginPromptDialog;
