import React from "react";
import { Plus, FolderPlus, Moon, Sun } from "lucide-react";

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onShowAddForm: () => void;
  onShowProjectForm: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onShowAddForm,
  onShowProjectForm,
}) => {
  return (
    <>
      {/* Header Section */}
      <div
        className={`p-6 text-white relative ${
          isDarkMode
            ? "bg-gradient-to-r from-gray-700 to-gray-600"
            : "bg-gradient-to-r from-blue-600 to-indigo-600"
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
            <p className={isDarkMode ? "text-gray-300" : "text-blue-100"}>
              Stay organized and productive
            </p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-gray-600 hover:bg-gray-500"
                : "bg-blue-500 hover:bg-blue-400"
            }`}
            title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={onShowAddForm}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <Plus size={16} />
            Add Task
          </button>

          <button
            onClick={onShowProjectForm}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isDarkMode
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-purple-500 hover:bg-purple-600 text-white"
            }`}
          >
            <FolderPlus size={16} />
            Projects/Folders
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
