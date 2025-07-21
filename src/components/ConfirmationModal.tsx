import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDarkMode: boolean;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDarkMode,
  isDestructive = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-xl ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isDestructive && (
              <AlertTriangle className="text-red-500" size={24} />
            )}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <p className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isDestructive
                ? "bg-red-600 text-white hover:bg-red-700"
                : isDarkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
