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

export interface TaskTemplate {
  id: number;
  name: string;
  description?: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultPriority: "low" | "medium" | "high";
  defaultSubtasks: string[];
  defaultProjectId?: number;
  defaultTags: string[];
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
