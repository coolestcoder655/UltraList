import React from "react";
import {
  Plus,
  FolderPlus,
  Moon,
  Sun,
  List,
  Columns,
  BarChart3,
  Grid3X3,
  Timer,
  Code,
} from "lucide-react";
import { ViewMode } from "../types";

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  devMode: boolean;
  onToggleDevMode: () => void;
  onShowAddForm: () => void;
  onShowProjectForm: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  devMode,
  onToggleDevMode,
  onShowAddForm,
  onShowProjectForm,
  viewMode,
  onViewModeChange,
}) => {
  const viewModeButtons = [
    { mode: "list" as ViewMode, icon: List, label: "List" },
    { mode: "kanban" as ViewMode, icon: Columns, label: "Kanban" },
    { mode: "gantt" as ViewMode, icon: BarChart3, label: "Gantt" },
    { mode: "eisenhower" as ViewMode, icon: Grid3X3, label: "Matrix" },
    { mode: "pomodoro" as ViewMode, icon: Timer, label: "Pomodoro" },
  ];

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
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-500 border border-gray-500 hover:border-gray-400"
                  : "bg-blue-500 hover:bg-blue-400 border border-blue-400 hover:border-blue-300"
              }`}
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-300" />
              ) : (
                <Moon size={20} className="text-white" />
              )}
            </button>
            
            <button
              onClick={onToggleDevMode}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                devMode
                  ? isDarkMode
                    ? "bg-green-600 hover:bg-green-500 border border-green-500 hover:border-green-400"
                    : "bg-green-500 hover:bg-green-400 border border-green-400 hover:border-green-300"
                  : isDarkMode
                    ? "bg-gray-600 hover:bg-gray-500 border border-gray-500 hover:border-gray-400"
                    : "bg-blue-500 hover:bg-blue-400 border border-blue-400 hover:border-blue-300"
              }`}
              title={`${devMode ? "Disable" : "Enable"} developer mode (shows debug buttons)`}
            >
              <Code 
                size={20} 
                className={devMode ? "text-white" : isDarkMode ? "text-gray-300" : "text-white"} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons and View Mode Selector */}
      <div className={`p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={onShowAddForm}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 transform ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            <Plus size={16} />
            Add Task
          </button>

          <button
            onClick={onShowProjectForm}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 transform ${
              isDarkMode
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl"
                : "bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            <FolderPlus size={16} />
            Projects/Folders
          </button>
        </div>

        {/* View Mode Selector */}
        <div className="mb-4">
          <h3
            className={`text-sm font-medium mb-3 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            View Mode
          </h3>
          <div className="flex flex-wrap gap-2">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all duration-300 hover:scale-105 transform ${
                  viewMode === mode
                    ? isDarkMode
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-blue-500 text-white shadow-lg"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
