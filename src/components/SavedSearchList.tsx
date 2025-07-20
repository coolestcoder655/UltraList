import React from "react";
import { X } from "lucide-react";
import type { SavedSearch, Project } from "../types";

interface SavedSearchListProps {
  savedSearches: SavedSearch[];
  projects: Project[];
  onApplySavedSearch: (filterBy: any, projectId: number | null) => void;
  onDeleteSavedSearch: (id: number) => void;
  isDarkMode: boolean;
}

const SavedSearchList: React.FC<SavedSearchListProps> = ({
  savedSearches,
  projects,
  onApplySavedSearch,
  onDeleteSavedSearch,
  isDarkMode,
}) => {
  if (savedSearches.length === 0) return null;

  return (
    <div
      className={`p-6 border rounded-lg shadow-sm mb-6 ${
        isDarkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Saved Searches
      </h3>
      <div className="grid gap-3">
        {savedSearches.map((search) => (
          <div
            key={search.id}
            className={`flex items-center justify-between p-3 border rounded-lg ${
              isDarkMode
                ? "border-gray-600 bg-gray-700"
                : "border-gray-300 bg-white"
            }`}
          >
            <div className="flex-1">
              <div
                className={`font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {search.name}
              </div>
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Filter: {search.filterBy || "all"} • Tags: {search.tags.length}{" "}
                • Project:{" "}
                {search.projectId
                  ? projects.find((p) => p.id === search.projectId)?.name ||
                    "Unknown"
                  : "All"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onApplySavedSearch(
                    search.filterBy || "all",
                    search.projectId || null
                  );
                }}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Apply
              </button>
              <button
                onClick={() => onDeleteSavedSearch(search.id)}
                className={`p-1 rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-red-400 hover:bg-gray-600"
                    : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedSearchList;
