import React from "react";

interface ModeSelectorProps {
  isSearchMode: boolean;
  isCreateMode: boolean;
  onModeSwitch: (mode: "search" | "create") => void;
  isDarkMode: boolean;
  disabled?: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  isSearchMode,
  isCreateMode,
  onModeSwitch,
  isDarkMode,
  disabled = false,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full space-y-3">
      {/* Mode Selector Toggle */}
      <div
        className={`relative flex items-center rounded-full p-1 transition-all duration-300 shadow-lg overflow-hidden ${
          isDarkMode
            ? "bg-gray-700 border border-gray-600"
            : "bg-white border border-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {/* Background Slider */}
        <div
          className={`absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] rounded-full transition-all duration-300 ease-in-out transform z-0 ${
            isCreateMode ? "translate-x-[calc(100%+2px)]" : "translate-x-0"
          } ${
            isDarkMode
              ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
              : "bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
          }`}
        />

        {/* Search Mode Button */}
        <button
          onClick={() => !disabled && onModeSwitch("search")}
          disabled={disabled}
          className={`relative z-20 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex-1 ${
            isSearchMode
              ? "text-white"
              : isDarkMode
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center justify-center space-x-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Search</span>
          </div>
        </button>

        {/* NLP Mode Button */}
        <button
          onClick={() => !disabled && onModeSwitch("create")}
          disabled={disabled}
          className={`relative z-20 px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 flex-1 ${
            isCreateMode
              ? "text-white"
              : isDarkMode
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center justify-center space-x-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Create</span>
          </div>
        </button>
      </div>

      {/* Mode Description */}
      <div className="text-center">
        <p
          className={`text-xs transition-all duration-300 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {isSearchMode
            ? "Search and filter your tasks"
            : "Create tasks with natural language"}
        </p>
      </div>
    </div>
  );
};

export default ModeSelector;
