import React from "react";
import { Search, X, Plus } from "lucide-react";
import type { SavedSearch } from "../types";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  savedSearches: SavedSearch[];
  activeSavedSearch: SavedSearch | null;
  onApplySavedSearch: (search: SavedSearch) => void;
  onClearSavedSearch: () => void;
  onSaveCurrentSearch: () => void;
  parseSearchQuery: (query: string) => any;
  isDarkMode: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  savedSearches,
  activeSavedSearch,
  onApplySavedSearch,
  onClearSavedSearch,
  onSaveCurrentSearch,
  parseSearchQuery,
  isDarkMode,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-start">
      {/* Smart Search Bar */}
      <div className="flex-1 min-w-64">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks... (try: #urgent, priority:high, project:work, status:completed, due:today)"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value);
              // Clear saved search when typing
              if (activeSavedSearch) {
                onClearSavedSearch();
              }
            }}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                : "border-gray-300 bg-white placeholder-gray-500"
            }`}
          />
          <Search
            size={16}
            className={`absolute left-3 top-3 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={`absolute right-3 top-2 p-1 rounded-full transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Saved Searches and other filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={activeSavedSearch?.id || ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const searchId = e.target.value;
            if (searchId === "") {
              onClearSavedSearch();
            } else {
              const search = savedSearches.find(
                (s) => s.id === parseInt(searchId)
              );
              if (search) {
                onApplySavedSearch(search);
                setSearchQuery(""); // Clear search when applying saved search
              }
            }
          }}
          className={`border rounded-lg px-3 py-2 ${
            isDarkMode
              ? "border-gray-600 bg-gray-700 text-white"
              : "border-gray-300 bg-white"
          }`}
        >
          <option value="">Saved Searches</option>
          {savedSearches.map((search) => (
            <option key={search.id} value={search.id}>
              {search.name}
            </option>
          ))}
        </select>
        {activeSavedSearch && (
          <button
            onClick={onClearSavedSearch}
            className={`px-3 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
            title="Clear saved search"
          >
            <X size={16} />
          </button>
        )}
        <button
          onClick={onSaveCurrentSearch}
          className={`px-3 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          title="Save current filters as search"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Active search filters display */}
      {searchQuery && (
        <div className="w-full">
          <div
            className={`flex flex-wrap gap-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <span className="text-sm font-medium">Active filters:</span>
            {(() => {
              const filters = parseSearchQuery(searchQuery);
              const activeFilters = [];
              if (filters.text) activeFilters.push(`Text: "${filters.text}"`);
              if (filters.tags.length > 0)
                activeFilters.push(
                  `Tags: ${filters.tags.map((t: string) => `#${t}`).join(", ")}`
                );
              if (filters.priority)
                activeFilters.push(`Priority: ${filters.priority}`);
              if (filters.projectName)
                activeFilters.push(`Project: ${filters.projectName}`);
              if (filters.status)
                activeFilters.push(`Status: ${filters.status}`);
              if (filters.due) activeFilters.push(`Due: ${filters.due}`);
              return activeFilters.map((filter, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode
                      ? "bg-blue-900 text-blue-200"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {filter}
                </span>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
