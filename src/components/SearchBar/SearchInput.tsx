import React from "react";
import { Search, X, Info, Plus, Sparkles } from "lucide-react";
import type { ParsedTask } from "../../services/databaseService";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  isSearchMode: boolean;
  isCreateMode: boolean;
  toggleMode: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Create mode props
  previewTask: ParsedTask | null;
  isCreating: boolean;
  onCreateTask: () => void;
  onShowNlpHelp: () => void;

  // Search mode props
  onShowSearchHelp: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  setSearchQuery,
  isDarkMode,
  isSearchMode,
  isCreateMode,
  toggleMode,
  inputRef,
  onKeyDown,
  onInputChange,
  previewTask,
  isCreating,
  onCreateTask,
  onShowNlpHelp,
  onShowSearchHelp,
}) => {
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div
      className={`flex items-center w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-300 ${
        isDarkMode
          ? "bg-gray-800 border-gray-600 text-white"
          : "bg-white border-gray-300 text-gray-900"
      } ${
        isCreateMode
          ? "border-purple-500 focus-within:border-purple-600 shadow-purple-100 dark:shadow-purple-900/20"
          : "focus-within:border-blue-500 shadow-blue-100 dark:shadow-blue-900/20"
      }`}
    >
      <button
        onClick={toggleMode}
        className={`mr-3 p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${
          isSearchMode
            ? isDarkMode
              ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
              : "text-gray-500 hover:text-gray-400 hover:bg-gray-100"
            : "text-purple-500 hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        }`}
        title={
          isSearchMode ? "Switch to NLP Task Creation" : "Switch to Search Mode"
        }
      >
        <div className="flex items-center gap-1">
          {isSearchMode ? (
            <Search size={18} />
          ) : (
            <>
              <Sparkles size={18} />
              <span className="text-xs font-semibold">NLP</span>
            </>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        placeholder={
          isSearchMode
            ? "Search tasks or use filters (priority:high, #tag, project:work...)"
            : "Describe your task in plain English... (e.g., 'Buy eggs tomorrow at 5pm #grocery')"
        }
        className="flex-1 bg-transparent outline-none placeholder-gray-500 transition-all duration-200"
      />

      <div className="flex items-center gap-2">
        {searchQuery && (
          <button
            onClick={clearSearch}
            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <X size={16} />
          </button>
        )}

        {isSearchMode && (
          <button
            onClick={onShowSearchHelp}
            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Info size={16} />
          </button>
        )}

        {isCreateMode && (
          <button
            onClick={onShowNlpHelp}
            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Info size={16} />
          </button>
        )}

        {isCreateMode && previewTask && (
          <button
            onClick={onCreateTask}
            disabled={isCreating}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              isCreating
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-500 text-white hover:bg-purple-600"
            }`}
          >
            <Plus size={14} />
            {isCreating ? "Creating..." : "Create"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
