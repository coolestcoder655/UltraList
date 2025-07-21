// Shared types for the Todo List application

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Folder {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface Project {
  id: number;
  name: string;
  color: string;
  description?: string;
  folderId?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  subtasks: Subtask[];
  projectId?: number;
  tags: string[];
}

export interface SavedSearch {
  id: number;
  name: string;
  tags: string[];
  priority?: "low" | "medium" | "high";
  projectId?: number;
  filterBy?: FilterBy;
  completed?: boolean;
}

export interface NewTask {
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  subtasks: string[];
  projectId?: number;
  tags: string[];
}

export interface EditingTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  subtasks: string[];
  projectId?: number;
  tags: string[];
}

export type TaskUpdate = Partial<Omit<Task, "id">>;
export type SortBy = "dueDate" | "priority" | "title" | "project";
export type FilterBy =
  | "all"
  | "completed"
  | "incomplete"
  | "high"
  | "project"
  | "today"
  | "overdue"
  | "urgent";
export type Priority = "low" | "medium" | "high";
export type SearchBarMode = "search" | "create";

export interface PriorityColors {
  low: string;
  medium: string;
  high: string;
}

export interface PriorityOrder {
  high: number;
  medium: number;
  low: number;
}

// View modes for different productivity views
export type ViewMode =
  | "list"
  | "backlog"
  | "focus";

// Extended task interface for additional view-specific data
export interface ExtendedTask extends Task {
  startDate?: string;
}
