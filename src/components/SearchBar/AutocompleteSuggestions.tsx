import React from "react";

interface AutocompleteSuggestionsProps {
  showSuggestions: boolean;
  suggestions: string[];
  activeSuggestionIndex: number;
  isDarkMode: boolean;
  isCreateMode: boolean;
  suggestionsRef: React.RefObject<HTMLDivElement>;
  onSuggestionClick: (suggestion: string) => void;
}

const AutocompleteSuggestions: React.FC<AutocompleteSuggestionsProps> = ({
  showSuggestions,
  suggestions,
  activeSuggestionIndex,
  isDarkMode,
  isCreateMode,
  suggestionsRef,
  onSuggestionClick,
}) => {
  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  const getSuggestionType = (suggestion: string): string => {
    if (suggestion.startsWith("#")) return "tag";
    if (suggestion.includes("priority")) return "priority";
    if (
      suggestion.includes("at ") ||
      suggestion.includes("am") ||
      suggestion.includes("pm")
    )
      return "time";
    if (
      [
        "today",
        "tomorrow",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
        "next week",
        "this weekend",
        "next weekend",
      ].some((d) => suggestion.includes(d))
    )
      return "date";
    return "keyword";
  };

  return (
    <div
      ref={suggestionsRef}
      className={`absolute z-[100] w-full mb-2 bottom-full border rounded-lg shadow-lg max-h-60 overflow-y-auto transform transition-all duration-300 ease-out animate-slideInUp ${
        isDarkMode
          ? "bg-gray-800 border-gray-600 shadow-xl"
          : "bg-white border-gray-300 shadow-xl"
      }`}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
          className={`w-full px-4 py-3 text-left transition-all duration-200 transform hover:scale-[1.02] ${
            index === activeSuggestionIndex
              ? isDarkMode
                ? "bg-blue-600 text-white shadow-md"
                : "bg-blue-500 text-white shadow-md"
              : isDarkMode
              ? "hover:bg-gray-700"
              : "hover:bg-gray-100"
          } ${index === 0 ? "rounded-t-lg" : ""} ${
            index === suggestions.length - 1 ? "rounded-b-lg" : ""
          }`}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className={`${
                index === activeSuggestionIndex
                  ? "text-white"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {suggestion}
            </span>
            {isCreateMode && (
              <span
                className={`text-xs ${
                  index === activeSuggestionIndex
                    ? "text-blue-100"
                    : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                {getSuggestionType(suggestion)}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default AutocompleteSuggestions;
