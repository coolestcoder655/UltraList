import React, { useState, useRef, useEffect } from "react";
import { Search, X, Plus } from "lucide-react";
import type { SavedSearch, Task, Project } from "../types";

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
  tasks: Task[];
  projects: Project[];
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
  tasks,
  projects,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate autocomplete suggestions based on current input
  const generateSuggestions = (query: string): string[] => {
    const lastWord = query.split(" ").pop() || "";
    const suggestions: string[] = [];

    if (!lastWord) return [];

    // Get unique tags from tasks
    const allTags = new Set<string>();
    tasks.forEach((task) => {
      task.tags.forEach((tag) => allTags.add(tag));
    });

    // Get project names
    const projectNames = projects.map((p) => p.name.toLowerCase());

    // Priority suggestions
    if (
      lastWord.startsWith("priority:") ||
      lastWord === "priority:" ||
      "priority:".includes(lastWord)
    ) {
      const priorities = ["priority:high", "priority:medium", "priority:low"];
      suggestions.push(...priorities.filter((p) => p.includes(lastWord)));
    }

    // Project suggestions
    if (
      lastWord.startsWith("project:") ||
      lastWord === "project:" ||
      "project:".includes(lastWord)
    ) {
      const projectSuggestions = projectNames.map((name) => `project:${name}`);
      suggestions.push(
        ...projectSuggestions.filter((p) => p.includes(lastWord.toLowerCase()))
      );
    }

    // Status suggestions
    if (
      lastWord.startsWith("status:") ||
      lastWord === "status:" ||
      "status:".includes(lastWord)
    ) {
      const statuses = ["status:completed", "status:incomplete"];
      suggestions.push(...statuses.filter((s) => s.includes(lastWord)));
    }

    // Due date suggestions
    if (
      lastWord.startsWith("due:") ||
      lastWord === "due:" ||
      "due:".includes(lastWord)
    ) {
      const dueDates = ["due:today", "due:overdue"];
      suggestions.push(...dueDates.filter((d) => d.includes(lastWord)));
    }

    // Tag suggestions
    if (lastWord.startsWith("#")) {
      const tagSuggestions = Array.from(allTags).map((tag) => `#${tag}`);
      suggestions.push(
        ...tagSuggestions.filter((t) =>
          t.toLowerCase().includes(lastWord.toLowerCase())
        )
      );
    } else if (lastWord && !lastWord.includes(":")) {
      // Show available prefixes when typing
      const prefixes = ["priority:", "project:", "status:", "due:"];
      suggestions.push(...prefixes.filter((p) => p.includes(lastWord)));

      // Also show tags without # prefix
      const tagSuggestions = Array.from(allTags).map((tag) => `#${tag}`);
      suggestions.push(
        ...tagSuggestions.filter((t) =>
          t.toLowerCase().includes(`#${lastWord.toLowerCase()}`)
        )
      );
    }

    return [...new Set(suggestions)].slice(0, 8); // Limit to 8 suggestions
  };

  // Handle input change and update suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setActiveSuggestionIndex(-1);

    // Clear saved search when typing
    if (activeSavedSearch) {
      onClearSavedSearch();
    }
  };

  // Handle suggestion selection
  const applySuggestion = (suggestion: string) => {
    const words = searchQuery.split(" ");
    words[words.length - 1] = suggestion;
    setSearchQuery(words.join(" ") + " ");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          applySuggestion(suggestions[activeSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="flex flex-wrap gap-4 items-start">
      {/* Smart Search Bar */}
      <div className="flex-1 min-w-64">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks... (try: #urgent, priority:high, project:work, status:completed, due:today)"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              const newSuggestions = generateSuggestions(searchQuery);
              setSuggestions(newSuggestions);
              setShowSuggestions(newSuggestions.length > 0);
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
              onClick={() => {
                setSearchQuery("");
                setShowSuggestions(false);
              }}
              className={`absolute right-3 top-2 p-1 rounded-full transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <X size={14} />
            </button>
          )}

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-200 bg-white"
              }`}
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => applySuggestion(suggestion)}
                  className={`w-full text-left px-3 py-2 hover:bg-opacity-80 transition-colors ${
                    index === activeSuggestionIndex
                      ? isDarkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-800"
                      : isDarkMode
                      ? "text-gray-200 hover:bg-gray-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-mono text-sm">{suggestion}</span>
                  {suggestion.includes(":") && (
                    <span
                      className={`ml-2 text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {suggestion.startsWith("priority:") &&
                        "Set task priority"}
                      {suggestion.startsWith("project:") && "Filter by project"}
                      {suggestion.startsWith("status:") &&
                        "Filter by completion status"}
                      {suggestion.startsWith("due:") && "Filter by due date"}
                    </span>
                  )}
                  {suggestion.startsWith("#") && (
                    <span
                      className={`ml-2 text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Filter by tag
                    </span>
                  )}
                </button>
              ))}
            </div>
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
