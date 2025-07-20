import { useState } from "react";
import type { Task as TaskType, Priority, FilterBy, Project } from "../types";

export const useTaskFiltering = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterBy] = useState<FilterBy>("all");
  const [selectedProjectId] = useState<number | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

  const toggleExpanded = (id: number): void => {
    const newExpanded: Set<number> = new Set(expandedTasks);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTasks(newExpanded);
  };

  // Parse search query for special filters
  const parseSearchQuery = (query: string) => {
    const filters = {
      text: "",
      tags: [] as string[],
      priority: undefined as Priority | undefined,
      projectName: undefined as string | undefined,
      status: undefined as "completed" | "incomplete" | undefined,
      due: undefined as "today" | "overdue" | undefined,
    };

    // Split query into parts and process each
    const parts = query.split(/\s+/).filter((part) => part.length > 0);

    for (const part of parts) {
      if (part.startsWith("#")) {
        // Tag filter: #urgent
        const tag = part.slice(1).toLowerCase();
        if (tag) filters.tags.push(tag);
      } else if (part.startsWith("priority:")) {
        // Priority filter: priority:high
        const priority = part.slice(9).toLowerCase() as Priority;
        if (["low", "medium", "high"].includes(priority)) {
          filters.priority = priority;
        }
      } else if (part.startsWith("project:")) {
        // Project filter: project:work
        filters.projectName = part.slice(8).toLowerCase();
      } else if (part.startsWith("status:")) {
        // Status filter: status:completed
        const status = part.slice(7).toLowerCase();
        if (status === "completed" || status === "incomplete") {
          filters.status = status;
        }
      } else if (part.startsWith("due:")) {
        // Due date filter: due:today
        const due = part.slice(4).toLowerCase();
        if (due === "today" || due === "overdue") {
          filters.due = due;
        }
      } else {
        // Regular text search
        filters.text += (filters.text ? " " : "") + part;
      }
    }

    return filters;
  };

  const isOverdue = (dateString: string): boolean => {
    if (!dateString) return false;
    try {
      const taskDate = new Date(dateString);
      const today = new Date();
      taskDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return taskDate < today;
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return false;
    }
  };

  const getFilteredAndSortedTasks = (
    tasks: TaskType[],
    getProjectById: (id: number) => Project | undefined
  ): TaskType[] => {
    const filteredTasks: TaskType[] = tasks.filter((task: TaskType) => {
      // Parse search query
      const searchFilters = parseSearchQuery(searchQuery);

      // Text search in title and description
      if (searchFilters.text) {
        const searchText = searchFilters.text.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchText);
        const descriptionMatch = task.description
          ?.toLowerCase()
          .includes(searchText);
        if (!titleMatch && !descriptionMatch) return false;
      }

      // Tag filters from search
      if (searchFilters.tags.length > 0) {
        const hasMatchingTag = searchFilters.tags.some((searchTag) =>
          task.tags.some((taskTag) => taskTag.toLowerCase().includes(searchTag))
        );
        if (!hasMatchingTag) return false;
      }

      // Priority filter from search
      if (searchFilters.priority && task.priority !== searchFilters.priority) {
        return false;
      }

      // Project name filter from search
      if (searchFilters.projectName) {
        const taskProject = getProjectById(task.projectId || 0);
        const projectMatch = taskProject?.name
          .toLowerCase()
          .includes(searchFilters.projectName);
        if (!projectMatch) return false;
      }

      // Status filter from search
      if (searchFilters.status === "completed" && !task.completed) return false;
      if (searchFilters.status === "incomplete" && task.completed) return false;

      // Due date filter from search
      if (searchFilters.due === "today") {
        const today = new Date().toISOString().split("T")[0];
        if (task.dueDate !== today) return false;
      }
      if (searchFilters.due === "overdue") {
        if (!isOverdue(task.dueDate) || task.completed) return false;
      }

      // First filter by selected project (if no search project filter)
      if (
        !searchFilters.projectName &&
        selectedProjectId !== null &&
        task.projectId !== selectedProjectId
      ) {
        return false;
      }

      // Then apply other filters (only if no search query)
      if (!searchQuery.trim()) {
        if (filterBy === "completed") return task.completed;
        if (filterBy === "incomplete") return !task.completed;
        if (filterBy === "high") return task.priority === "high";
        if (filterBy === "today") {
          const today = new Date().toISOString().split("T")[0];
          return task.dueDate === today;
        }
        if (filterBy === "overdue") {
          return isOverdue(task.dueDate) && !task.completed;
        }
        if (filterBy === "urgent") {
          return (
            (task.priority === "high" || isOverdue(task.dueDate)) &&
            !task.completed
          );
        }
      }
      return true;
    });

    const sortedTasks: TaskType[] = [...filteredTasks].sort(
      (a: TaskType, b: TaskType) => {
        // Default sort by due date
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    );

    return sortedTasks;
  };

  return {
    searchQuery,
    setSearchQuery,
    filterBy,
    selectedProjectId,
    expandedTasks,
    toggleExpanded,
    parseSearchQuery,
    getFilteredAndSortedTasks,
  };
};
