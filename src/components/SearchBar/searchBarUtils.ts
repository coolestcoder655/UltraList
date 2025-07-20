import type { Task, Project } from "../../types";

export interface NlpSuggestionCategories {
  priorityKeywords: string[];
  timeKeywords: string[];
  dateKeywords: string[];
  commonTags: string[];
  projectKeywords: string[];
}

export const getNlpCategories = (): NlpSuggestionCategories => ({
  priorityKeywords: [
    "urgent",
    "important",
    "asap",
    "critical",
    "high priority",
    "medium priority",
    "low priority",
    "normal",
    "moderate",
    "minor",
  ],
  timeKeywords: [
    "at 9am",
    "at 10am",
    "at 11am",
    "at 12pm",
    "at 1pm",
    "at 2pm",
    "at 3pm",
    "at 4pm",
    "at 5pm",
    "at 6pm",
    "at 7pm",
    "at 8pm",
    "morning",
    "afternoon",
    "evening",
    "noon",
    "midnight",
  ],
  dateKeywords: [
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
    "next monday",
    "next tuesday",
    "next wednesday",
    "next thursday",
    "next friday",
    "next saturday",
    "next sunday",
  ],
  commonTags: [
    "#work",
    "#personal",
    "#shopping",
    "#health",
    "#finance",
    "#family",
    "#urgent",
    "#meeting",
    "#call",
    "#email",
    "#research",
    "#project",
    "#home",
    "#office",
    "#travel",
    "#study",
    "#exercise",
    "#appointment",
  ],
  projectKeywords: [
    "for work",
    "for personal",
    "for project",
    "work project",
    "side project",
    "team project",
    "client work",
  ],
});

export const generateSearchSuggestions = (
  query: string,
  tasks: Task[]
): string[] => {
  const lastWord = query.split(" ").pop() || "";
  const suggestions: string[] = [];

  if (!lastWord) return [];

  // Get unique tags from tasks
  const allTags = new Set<string>();
  tasks.forEach((task) => {
    task.tags.forEach((tag) => allTags.add(tag));
  });

  // Priority filter
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
  if (lastWord.startsWith("s") && "status".startsWith(lastWord.toLowerCase())) {
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

  return suggestions.slice(0, 5);
};

export const generateNlpSuggestions = (query: string): string[] => {
  const lastWord = query.split(" ").pop() || "";
  const lowerLastWord = lastWord.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const suggestions: string[] = [];

  if (!lastWord) return [];

  const categories = getNlpCategories();

  // Context-aware suggestions based on existing text
  const contextSuggestions: string[] = [];

  // If query contains words suggesting a meeting/call
  if (
    lowerQuery.includes("meeting") ||
    lowerQuery.includes("call") ||
    lowerQuery.includes("interview")
  ) {
    contextSuggestions.push(
      "at 10am",
      "at 2pm",
      "at 3pm",
      "#meeting",
      "urgent"
    );
  }

  // If query suggests shopping/errands
  if (
    lowerQuery.includes("buy") ||
    lowerQuery.includes("shop") ||
    lowerQuery.includes("pick up")
  ) {
    contextSuggestions.push("#shopping", "#errands", "today", "tomorrow");
  }

  // If query suggests work tasks
  if (
    lowerQuery.includes("email") ||
    lowerQuery.includes("report") ||
    lowerQuery.includes("review")
  ) {
    contextSuggestions.push("#work", "urgent", "today", "#office");
  }

  // Match date keywords
  categories.dateKeywords.forEach((keyword) => {
    if (
      keyword.toLowerCase().startsWith(lowerLastWord) &&
      lowerLastWord.length >= 1
    ) {
      suggestions.push(keyword);
    }
  });

  // Match priority keywords
  categories.priorityKeywords.forEach((keyword) => {
    if (
      keyword.toLowerCase().includes(lowerLastWord) &&
      lowerLastWord.length >= 2
    ) {
      suggestions.push(keyword);
    }
  });

  // Match time keywords
  categories.timeKeywords.forEach((keyword) => {
    if (
      keyword.toLowerCase().includes(lowerLastWord) &&
      lowerLastWord.length >= 1
    ) {
      suggestions.push(keyword);
    }
  });

  // Match common tags
  if (lastWord.startsWith("#")) {
    const tagQuery = lastWord.substring(1).toLowerCase();
    categories.commonTags.forEach((tag) => {
      if (tag.substring(1).toLowerCase().startsWith(tagQuery)) {
        suggestions.push(tag);
      }
    });
  } else {
    categories.commonTags.forEach((tag) => {
      const tagWord = tag.substring(1);
      if (
        tagWord.toLowerCase().startsWith(lowerLastWord) &&
        lowerLastWord.length >= 2
      ) {
        suggestions.push(tag);
      }
    });
  }

  // Match project keywords
  categories.projectKeywords.forEach((keyword) => {
    if (
      keyword.toLowerCase().includes(lowerLastWord) &&
      lowerLastWord.length >= 2
    ) {
      suggestions.push(keyword);
    }
  });

  // Add context-aware suggestions
  contextSuggestions.forEach((suggestion) => {
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  });

  return [...new Set(suggestions)].slice(0, 8);
};

export const getSecondaryOptions = (
  prefix: string,
  projects: Project[]
): string[] => {
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

export const applyNlpSuggestionLogic = (
  searchQuery: string,
  suggestion: string
): string => {
  const categories = getNlpCategories();
  let currentText = searchQuery.trim();

  // Determine what category the new suggestion belongs to
  let suggestionCategory: string[] = [];
  if (
    categories.priorityKeywords.some(
      (k) => k.toLowerCase() === suggestion.toLowerCase()
    )
  ) {
    suggestionCategory = categories.priorityKeywords;
  } else if (
    categories.timeKeywords.some(
      (k) => k.toLowerCase() === suggestion.toLowerCase()
    )
  ) {
    suggestionCategory = categories.timeKeywords;
  } else if (
    categories.dateKeywords.some(
      (k) => k.toLowerCase() === suggestion.toLowerCase()
    )
  ) {
    suggestionCategory = categories.dateKeywords;
  }

  // If this is a categorized suggestion, remove any existing keywords from that category
  if (suggestionCategory.length > 0) {
    // Remove any existing keywords from the same category
    suggestionCategory.forEach((keyword) => {
      const regex = new RegExp(
        `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "gi"
      );
      currentText = currentText.replace(regex, "");
    });

    // Clean up multiple spaces
    currentText = currentText.replace(/\s+/g, " ").trim();

    // Add the new suggestion
    return currentText + (currentText ? " " : "") + suggestion + " ";
  } else {
    // Handle non-categorized suggestions (tags, etc.) - replace last word
    const words = searchQuery.split(" ");
    const lastWord = words[words.length - 1];

    if (suggestion.startsWith("#") && lastWord.startsWith("#")) {
      words[words.length - 1] = suggestion;
    } else if (suggestion.startsWith("#") && !lastWord.startsWith("#")) {
      words[words.length - 1] = suggestion;
    } else if (suggestion.includes(" ")) {
      words[words.length - 1] = suggestion;
    } else {
      words[words.length - 1] = suggestion;
    }
    return words.join(" ") + " ";
  }
};
