import React, { useState, useRef, useEffect } from "react";
import { Search, X, Info, Plus, Sparkles } from "lucide-react";
import type { Task, Project } from "../types";
import { useSearchBarMode } from "../hooks/useSearchBarMode";
import { createTask } from "../services/databaseService";
import type { ParsedTask } from "../services/databaseService";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  parseSearchQuery: (query: string) => any;
  isDarkMode: boolean;
  tasks: Task[];
  projects: Project[];
  onTaskCreated?: () => void; // Callback to refresh tasks after creation
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  parseSearchQuery,
  isDarkMode,
  tasks,
  projects,
  onTaskCreated,
}) => {
  const { mode, toggleMode, parseInput, isSearchMode, isCreateMode } =
    useSearchBarMode();

  // Search mode states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);
  const [secondaryOptions, setSecondaryOptions] = useState<string[]>([]);
  const [activeSecondaryIndex, setActiveSecondaryIndex] = useState(-1);
  const [pendingPrefix, setPendingPrefix] = useState<string>("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Create mode states
  const [isCreating, setIsCreating] = useState(false);
  const [previewTask, setPreviewTask] = useState<ParsedTask | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);

  // Preview natural language parsing as user types
  useEffect(() => {
    if (isCreateMode && searchQuery.trim()) {
      const delayedParse = setTimeout(async () => {
        try {
          const parsed = await parseInput(searchQuery);
          setPreviewTask(parsed);
          setShowPreview(true);
        } catch (error) {
          console.error("Failed to parse task:", error);
          setShowPreview(false);
        }
      }, 500); // Debounce for 500ms

      return () => clearTimeout(delayedParse);
    } else {
      setShowPreview(false);
      setPreviewTask(null);
    }
  }, [searchQuery, isCreateMode, parseInput]);

  // Generate autocomplete suggestions for search mode
  const generateSuggestions = (query: string): string[] => {
    if (isCreateMode) return []; // No suggestions in create mode

    const lastWord = query.split(" ").pop() || "";
    const suggestions: string[] = [];

    if (!lastWord) return [];

    // Get unique tags from tasks
    const allTags = new Set<string>();
    tasks.forEach((task) => {
      task.tags.forEach((tag) => allTags.add(tag));
    });

    // Priority filter - show just "priority" as option
    if (
      lastWord.startsWith("p") &&
      "priority".startsWith(lastWord.toLowerCase())
    ) {
      suggestions.push("priority");
    }

    // Project filter
    if (
      lastWord.startsWith("p") &&
      "project".startsWith(lastWord.toLowerCase())
    ) {
      suggestions.push("project");
    }

    // Status filter
    if (
      lastWord.startsWith("s") &&
      "status".startsWith(lastWord.toLowerCase())
    ) {
      suggestions.push("status");
    }

    // Due filter
    if (lastWord.startsWith("d") && "due".startsWith(lastWord.toLowerCase())) {
      suggestions.push("due");
    }

    // Tag suggestions
    if (lastWord.startsWith("#")) {
      const tagQuery = lastWord.substring(1).toLowerCase();
      allTags.forEach((tag) => {
        if (tag.toLowerCase().includes(tagQuery)) {
          suggestions.push(`#${tag}`);
        }
      });
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  // Get secondary options for filter prefixes
  const getSecondaryOptions = (prefix: string): string[] => {
    switch (prefix) {
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

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (isSearchMode) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setActiveSuggestionIndex(-1);

      // Close secondary dropdown when typing
      setShowSecondaryDropdown(false);
      setPendingPrefix("");
      setSecondaryOptions([]);
    }
  };

  // Handle suggestion selection (search mode only)
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

  // Handle secondary option selection (search mode only)
  const applySecondaryOption = (option: string) => {
    const words = searchQuery.split(" ");
    words[words.length - 1] = `${pendingPrefix}:${option}`;
    setSearchQuery(words.join(" ") + " ");
    setShowSecondaryDropdown(false);
    setPendingPrefix("");
    setSecondaryOptions([]);
    inputRef.current?.focus();
  };

  // Handle creating task from natural language (create mode only)
  const handleCreateTask = async () => {
    if (!previewTask || isCreating) return;

    setIsCreating(true);
    try {
      // Find project ID if project name is mentioned
      let projectId: number | undefined;
      if (previewTask.project_name) {
        const project = projects.find(
          (p) =>
            p.name.toLowerCase() === previewTask.project_name?.toLowerCase()
        );
        projectId = project?.id;
      }

      // Create the task
      await createTask({
        title: previewTask.title,
        description: previewTask.description,
        due_date: previewTask.due_date,
        priority: previewTask.priority,
        project_id: projectId || null,
        subtasks: [],
        tags: previewTask.tags,
      });

      // Clear input and preview
      setSearchQuery("");
      setPreviewTask(null);
      setShowPreview(false);

      // Notify parent to refresh tasks
      onTaskCreated?.();

      // Show success feedback
      console.log("Task created successfully!");
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key for create mode
    if (isCreateMode && e.key === "Enter" && previewTask && !isCreating) {
      e.preventDefault();
      handleCreateTask();
      return;
    }

    // Handle search mode keyboard navigation
    if (isSearchMode) {
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
    }
  };

  // Close dropdowns when clicking outside
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
        setActiveSuggestionIndex(-1);
        setActiveSecondaryIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse active filters for display (search mode only)
  const activeFilters = isSearchMode ? parseSearchQuery(searchQuery) : {};

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Mode Toggle Button */}
      <div className="flex justify-center mb-4">
        <div
          className={`flex rounded-lg p-1 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <button
            onClick={() => mode !== "search" && toggleMode()}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isSearchMode
                ? `${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  } shadow-sm`
                : `${
                    isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`
            }`}
          >
            <Search size={16} />
            Search & Filter
          </button>
          <button
            onClick={() => mode !== "create" && toggleMode()}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isCreateMode
                ? `${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  } shadow-sm`
                : `${
                    isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`
            }`}
          >
            <Sparkles size={16} />
            Create with AI
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div
          className={`flex items-center w-full px-4 py-3 border rounded-lg shadow-sm transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          } ${
            isCreateMode
              ? "border-purple-500 focus-within:border-purple-600"
              : "focus-within:border-blue-500"
          }`}
        >
          {isSearchMode ? (
            <Search
              size={20}
              className={`mr-3 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
          ) : (
            <Sparkles size={20} className="mr-3 text-purple-500" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isSearchMode
                ? "Search tasks or use filters (priority:high, #tag, project:work...)"
                : "Describe your task in plain English... (e.g., 'Buy eggs tomorrow at 5pm #grocery')"
            }
            className="flex-1 bg-transparent outline-none placeholder-gray-500"
          />

          <div className="flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                  setShowPreview(false);
                  setPreviewTask(null);
                }}
                className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <X size={16} />
              </button>
            )}

            {isSearchMode && (
              <button
                onClick={() => setShowHelpModal(true)}
                className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Info size={16} />
              </button>
            )}

            {isCreateMode && previewTask && (
              <button
                onClick={handleCreateTask}
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

        {/* Search Mode: Active Filters Display */}
        {isSearchMode && Object.keys(activeFilters).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => (
              <span
                key={key}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? "bg-blue-900 text-blue-200"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
              </span>
            ))}
          </div>
        )}

        {/* Create Mode: Task Preview */}
        {isCreateMode && showPreview && previewTask && (
          <div
            className={`mt-3 p-4 rounded-lg border-l-4 border-purple-500 ${
              isDarkMode
                ? "bg-gray-800 border-r border-t border-b border-gray-600"
                : "bg-purple-50 border-r border-t border-b border-purple-200"
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
                    className={`px-2 py-1 rounded text-xs ${
                      previewTask.priority === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : previewTask.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
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
        )}

        {/* Search Mode: Suggestions Dropdown */}
        {isSearchMode && showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto ${
              isDarkMode
                ? "bg-gray-800 border-gray-600"
                : "bg-white border-gray-300"
            }`}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => applySuggestion(suggestion)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  index === activeSuggestionIndex
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                } ${index === 0 ? "rounded-t-lg" : ""} ${
                  index === suggestions.length - 1 ? "rounded-b-lg" : ""
                }`}
              >
                <span
                  className={`${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Search Mode: Secondary Options Dropdown */}
        {isSearchMode &&
          showSecondaryDropdown &&
          secondaryOptions.length > 0 && (
            <div
              ref={secondaryRef}
              className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            >
              {secondaryOptions.map((option, index) => (
                <button
                  key={option}
                  onClick={() => applySecondaryOption(option)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    index === activeSecondaryIndex
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  } ${index === 0 ? "rounded-t-lg" : ""} ${
                    index === secondaryOptions.length - 1 ? "rounded-b-lg" : ""
                  }`}
                >
                  <span
                    className={`${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {option}
                  </span>
                </button>
              ))}
            </div>
          )}
      </div>

      {/* Search Mode: Help Modal */}
      {isSearchMode && showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`max-w-2xl w-full mx-4 p-6 rounded-lg shadow-xl ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Search Help</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4
                  className={`font-medium mb-2 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  🔍 Filter Options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div
                      className={`font-medium text-sm ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Priority Filter
                    </div>
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <code>priority:high</code>, <code>priority:medium</code>,{" "}
                      <code>priority:low</code>
                    </div>
                  </div>
                  <div>
                    <div
                      className={`font-medium text-sm ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Status Filter
                    </div>
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <code>status:completed</code>,{" "}
                      <code>status:incomplete</code>
                    </div>
                  </div>
                  <div>
                    <div
                      className={`font-medium text-sm ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Due Date Filter
                    </div>
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <code>due:today</code>, <code>due:overdue</code>
                    </div>
                  </div>
                  <div>
                    <div
                      className={`font-medium text-sm ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Tag Filter
                    </div>
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <code>#work</code>, <code>#personal</code>,{" "}
                      <code>#urgent</code>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`font-medium text-sm ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Text Search
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Just type any text to search in task titles and descriptions
                </div>
              </div>

              <div
                className={`mt-4 p-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-blue-50"
                }`}
              >
                <div
                  className={`font-medium text-sm ${
                    isDarkMode ? "text-blue-400" : "text-blue-800"
                  }`}
                >
                  💡 Pro Tip
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-blue-700"
                  }`}
                >
                  Combine multiple filters! Try:{" "}
                  <code
                    className={`px-1 rounded ${
                      isDarkMode
                        ? "bg-gray-600 text-gray-200"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    priority:high #urgent project:work
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
