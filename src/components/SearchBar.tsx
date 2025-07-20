import React, { useState, useRef, useEffect } from "react";
import { Search, X, Info } from "lucide-react";
import type { Task, Project } from "../types";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  parseSearchQuery: (query: string) => any;
  isDarkMode: boolean;
  tasks: Task[];
  projects: Project[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  parseSearchQuery,
  isDarkMode,
  tasks,
  projects,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);
  const [secondaryOptions, setSecondaryOptions] = useState<string[]>([]);
  const [activeSecondaryIndex, setActiveSecondaryIndex] = useState(-1);
  const [pendingPrefix, setPendingPrefix] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);

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

    // Check if user is typing a filter prefix
    const filterPrefixes = ["priority", "project", "status", "due"];

    // Priority filter - show just "priority" as option
    if ("priority".includes(lastWord.toLowerCase()) && lastWord.length > 0) {
      suggestions.push("priority");
    }

    // Project filter - show just "project" as option
    if ("project".includes(lastWord.toLowerCase()) && lastWord.length > 0) {
      suggestions.push("project");
    }

    // Status filter - show just "status" as option
    if ("status".includes(lastWord.toLowerCase()) && lastWord.length > 0) {
      suggestions.push("status");
    }

    // Due filter - show just "due" as option
    if ("due".includes(lastWord.toLowerCase()) && lastWord.length > 0) {
      suggestions.push("due");
    }

    // Tag suggestions
    if (lastWord.startsWith("#")) {
      const tagSuggestions = Array.from(allTags).map((tag) => `#${tag}`);
      suggestions.push(
        ...tagSuggestions.filter((t) =>
          t.toLowerCase().includes(lastWord.toLowerCase())
        )
      );
    } else if (
      lastWord &&
      !filterPrefixes.some((prefix) => prefix.includes(lastWord.toLowerCase()))
    ) {
      // Also show tags without # prefix when not typing filter prefixes
      const tagSuggestions = Array.from(allTags).map((tag) => `#${tag}`);
      suggestions.push(
        ...tagSuggestions.filter((t) =>
          t.toLowerCase().includes(`#${lastWord.toLowerCase()}`)
        )
      );
    }

    return [...new Set(suggestions)].slice(0, 8); // Limit to 8 suggestions
  };

  // Get secondary options for a selected filter
  const getSecondaryOptions = (filterType: string): string[] => {
    switch (filterType) {
      case "priority":
        return ["high", "medium", "low"];
      case "status":
        return ["completed", "incomplete"];
      case "due":
        return ["today", "overdue"];
      case "project":
        return projects.map((p) => p.name.toLowerCase());
      default:
        return [];
    }
  };

  // Handle input change and update suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setActiveSuggestionIndex(-1);

    // Close secondary dropdown when typing
    setShowSecondaryDropdown(false);
    setPendingPrefix("");
    setSecondaryOptions([]);
  };

  // Handle suggestion selection
  const applySuggestion = (suggestion: string) => {
    const filterTypes = ["priority", "project", "status", "due"];

    if (filterTypes.includes(suggestion)) {
      // This is a filter type, auto-complete with colon and show secondary dropdown
      const words = searchQuery.split(" ");
      words[words.length - 1] = `${suggestion}:`;
      setSearchQuery(words.join(" "));

      setPendingPrefix(suggestion);
      const options = getSecondaryOptions(suggestion);
      setSecondaryOptions(options);
      setShowSecondaryDropdown(true);
      setShowSuggestions(false);
      setActiveSecondaryIndex(0);
      inputRef.current?.focus();
    } else {
      // This is a direct suggestion (like a tag), apply it immediately
      const words = searchQuery.split(" ");
      words[words.length - 1] = suggestion;
      setSearchQuery(words.join(" ") + " ");
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  // Handle secondary option selection
  const applySecondaryOption = (option: string) => {
    const words = searchQuery.split(" ");
    words[words.length - 1] = `${pendingPrefix}:${option}`;
    setSearchQuery(words.join(" ") + " ");
    setShowSecondaryDropdown(false);
    setPendingPrefix("");
    setSecondaryOptions([]);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle secondary dropdown navigation
    if (showSecondaryDropdown) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveSecondaryIndex((prev) =>
            prev < secondaryOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveSecondaryIndex((prev) =>
            prev > 0 ? prev - 1 : secondaryOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (activeSecondaryIndex >= 0) {
            applySecondaryOption(secondaryOptions[activeSecondaryIndex]);
          }
          break;
        case "Escape":
          setShowSecondaryDropdown(false);
          setPendingPrefix("");
          setSecondaryOptions([]);
          setActiveSecondaryIndex(-1);
          break;
      }
      return;
    }

    // Handle primary suggestions navigation
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
        secondaryRef.current &&
        !secondaryRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowSecondaryDropdown(false);
        setPendingPrefix("");
        setSecondaryOptions([]);
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
            placeholder="Search tasks..."
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
                setShowSecondaryDropdown(false);
                setPendingPrefix("");
                setSecondaryOptions([]);
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
                  {["priority", "project", "status", "due"].includes(
                    suggestion
                  ) && (
                    <span
                      className={`ml-2 text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {suggestion === "priority" && "Set task priority"}
                      {suggestion === "project" && "Filter by project"}
                      {suggestion === "status" && "Filter by completion status"}
                      {suggestion === "due" && "Filter by due date"}
                      <span className="ml-1">→</span>
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

          {/* Secondary Options Dropdown */}
          {showSecondaryDropdown && secondaryOptions.length > 0 && (
            <div
              ref={secondaryRef}
              className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`px-3 py-2 text-xs font-medium border-b ${
                  isDarkMode
                    ? "text-gray-400 border-gray-600"
                    : "text-gray-500 border-gray-200"
                }`}
              >
                Select {pendingPrefix}:
              </div>
              {secondaryOptions.map((option, index) => (
                <button
                  key={option}
                  onClick={() => applySecondaryOption(option)}
                  className={`w-full text-left px-3 py-2 hover:bg-opacity-80 transition-colors ${
                    index === activeSecondaryIndex
                      ? isDarkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-800"
                      : isDarkMode
                      ? "text-gray-200 hover:bg-gray-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-mono text-sm">{option}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
