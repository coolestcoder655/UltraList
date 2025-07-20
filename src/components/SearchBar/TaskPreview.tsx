import React from "react";
import type { ParsedTask } from "../../services/databaseService";

interface TaskPreviewProps {
  showPreview: boolean;
  previewTask: ParsedTask | null;
  isDarkMode: boolean;
}

const TaskPreview: React.FC<TaskPreviewProps> = ({
  showPreview,
  previewTask,
  isDarkMode,
}) => {
  if (!showPreview || !previewTask) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  return (
    <div
      className={`mt-3 p-4 rounded-lg border-l-4 border-purple-500 transform transition-all duration-500 ease-out animate-slideInUp ${
        isDarkMode
          ? "bg-gray-800 border-r border-t border-b border-gray-600 shadow-lg"
          : "bg-purple-50 border-r border-t border-b border-purple-200 shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4
            className={`font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            📝 {previewTask.title}
          </h4>
          {previewTask.description && (
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {previewTask.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                previewTask.priority
              )}`}
            >
              {previewTask.priority} priority
            </span>
            {previewTask.due_date && (
              <span
                className={`px-2 py-1 rounded text-xs ${
                  isDarkMode
                    ? "bg-blue-900 text-blue-200"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                📅 {previewTask.due_date}
              </span>
            )}
            {previewTask.project_name && (
              <span
                className={`px-2 py-1 rounded text-xs ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                📁 {previewTask.project_name}
              </span>
            )}
            {previewTask.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 rounded text-xs ${
                  isDarkMode
                    ? "bg-purple-900 text-purple-200"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPreview;
