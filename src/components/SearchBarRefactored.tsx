import React, { useState, useRef, useEffect } from "react";
import type { Task, Project } from "../types";
import { useSearchBarMode } from "../hooks/useSearchBarMode";
import { createTask } from "../services/databaseService";
import type { ParsedTask } from "../services/databaseService";

// Import sub-components
import SearchInput from "./SearchBar/SearchInput";
import AutocompleteSuggestions from "./SearchBar/AutocompleteSuggestions";
import TaskPreview from "./SearchBar/TaskPreview";
import SearchHelpModal from "./SearchBar/SearchHelpModal";
import NlpHelpModal from "./SearchBar/NlpHelpModal";

// Import utilities
import {
  generateSearchSuggestions,
  generateNlpSuggestions,
  getSecondaryOptions,
  applyNlpSuggestionLogic,
} from "./SearchBar/searchBarUtils";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  parseSearchQuery: (query: string) => any;
  isDarkMode: boolean;
  tasks: Task[];
  projects: Project[];
  onTaskCreated?: () => void;
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
  const { toggleMode, parseInput, isSearchMode, isCreateMode } =
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
  const [showNlpHelpModal, setShowNlpHelpModal] = useState(false);

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
      }, 500);

      return () => clearTimeout(delayedParse);
    } else {
      setShowPreview(false);
      setPreviewTask(null);
    }
  }, [searchQuery, isCreateMode, parseInput]);

  // Generate suggestions based on mode
  const generateSuggestions = (query: string): string[] => {
    if (isCreateMode) {
      return generateNlpSuggestions(query);
    } else {
      return generateSearchSuggestions(query, tasks);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setActiveSuggestionIndex(-1);

    if (isSearchMode) {
      setShowSecondaryDropdown(false);
      setPendingPrefix("");
      setSecondaryOptions([]);
    }
  };

  // Handle suggestion selection for search mode
  const applySuggestion = (suggestion: string) => {
    const filterTypes = ["priority", "project", "status", "due"];

    if (filterTypes.includes(suggestion)) {
      const words = searchQuery.split(" ");
      words[words.length - 1] = `${suggestion}:`;
      setSearchQuery(words.join(" "));

      setPendingPrefix(suggestion);
      const options = getSecondaryOptions(suggestion, projects);
      setSecondaryOptions(options);
      setShowSecondaryDropdown(true);
      setShowSuggestions(false);
      setActiveSecondaryIndex(0);
      inputRef.current?.focus();
    } else {
      // For all other suggestions, replace the last word completely
      const trimmedQuery = searchQuery.trim();
      const words = trimmedQuery.split(/\s+/).filter(word => word.length > 0);

      if (words.length > 0) {
        words[words.length - 1] = suggestion;
      } else {
        words.push(suggestion);
      }

      setSearchQuery(words.join(" ") + " ");
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  // Handle NLP suggestion selection
  const applyNlpSuggestion = (suggestion: string) => {
    const newQuery = applyNlpSuggestionLogic(searchQuery, suggestion);
    setSearchQuery(newQuery);
    setShowSuggestions(false);
    inputRef.current?.focus();
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

  // Handle creating task from natural language
  const handleCreateTask = async () => {
    if (!previewTask) return;

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

      setSearchQuery("");
      setPreviewTask(null);
      setShowPreview(false);
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      isCreateMode &&
      e.key === "Enter" &&
      previewTask &&
      !isCreating &&
      !showSuggestions
    ) {
      e.preventDefault();
      handleCreateTask();
      return;
    }

    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveSuggestionIndex((prev) => {
            const newIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
            setTimeout(() => {
              const suggestionElement = suggestionsRef.current?.children[
                newIndex
              ] as HTMLElement;
              suggestionElement?.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              });
            }, 0);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveSuggestionIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
            setTimeout(() => {
              const suggestionElement = suggestionsRef.current?.children[
                newIndex
              ] as HTMLElement;
              suggestionElement?.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              });
            }, 0);
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (activeSuggestionIndex >= 0) {
            if (isCreateMode) {
              applyNlpSuggestion(suggestions[activeSuggestionIndex]);
            } else {
              applySuggestion(suggestions[activeSuggestionIndex]);
            }
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          setActiveSuggestionIndex(-1);
          break;
      }
      return;
    }

    if (isSearchMode && showSecondaryDropdown) {
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

  const handleSuggestionClick = (suggestion: string) => {
    if (isCreateMode) {
      applyNlpSuggestion(suggestion);
    } else {
      applySuggestion(suggestion);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
          isSearchMode={isSearchMode}
          isCreateMode={isCreateMode}
          toggleMode={toggleMode}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
          onInputChange={handleInputChange}
          previewTask={previewTask}
          isCreating={isCreating}
          onCreateTask={handleCreateTask}
          onShowNlpHelp={() => setShowNlpHelpModal(true)}
          onShowSearchHelp={() => setShowHelpModal(true)}
        />

        {/* Active Filters Display */}
        {isSearchMode && Object.keys(activeFilters).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => (
              <span
                key={key}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode
                    ? "bg-blue-900 text-blue-200"
                    : "bg-blue-100 text-blue-800"
                  }`}
              >
                {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
              </span>
            ))}
          </div>
        )}

        {/* Task Preview */}
        <TaskPreview
          showPreview={showPreview}
          previewTask={previewTask}
          isDarkMode={isDarkMode}
        />

        {/* Autocomplete Suggestions */}
        <AutocompleteSuggestions
          showSuggestions={showSuggestions}
          suggestions={suggestions}
          activeSuggestionIndex={activeSuggestionIndex}
          isDarkMode={isDarkMode}
          isCreateMode={isCreateMode}
          suggestionsRef={suggestionsRef}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Secondary Options Dropdown */}
        {isSearchMode &&
          showSecondaryDropdown &&
          secondaryOptions.length > 0 && (
            <div
              ref={secondaryRef}
              className={`absolute z-[100] w-full mb-2 bottom-full border rounded-lg shadow-lg max-h-60 overflow-y-auto ${isDarkMode
                  ? "bg-gray-800 border-gray-600"
                  : "bg-white border-gray-300"
                }`}
            >
              {secondaryOptions.map((option, index) => (
                <button
                  key={option}
                  onClick={() => applySecondaryOption(option)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${index === activeSecondaryIndex
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                    } ${index === 0 ? "rounded-t-lg" : ""} ${index === secondaryOptions.length - 1 ? "rounded-b-lg" : ""
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

      {/* Help Modals */}
      <SearchHelpModal
        showModal={showHelpModal}
        isDarkMode={isDarkMode}
        onClose={() => setShowHelpModal(false)}
      />

      <NlpHelpModal
        showModal={showNlpHelpModal}
        isDarkMode={isDarkMode}
        onClose={() => setShowNlpHelpModal(false)}
      />
    </div>
  );
};

export default SearchBar;
