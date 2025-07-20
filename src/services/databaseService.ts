import { invoke } from "@tauri-apps/api/core";

// Types matching the Rust backend
export interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: string;
  completed: boolean;
  project_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSubtask {
  id: string;
  task_id: string;
  text: string;
  completed: boolean;
}

export interface DatabaseProject {
  id: number;
  name: string;
  color: string;
  description: string | null;
  folder_id: number | null;
}

export interface DatabaseFolder {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface TaskWithDetails {
  task: DatabaseTask;
  subtasks: DatabaseSubtask[];
  tags: string[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  due_date: string | null;
  priority: string;
  project_id: number | null;
  subtasks: string[];
  tags: string[];
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  due_date?: string;
  priority?: string;
  project_id?: number;
  completed?: boolean;
  subtasks?: string[];
  tags?: string[];
}

// Task operations
export const taskService = {
  async createTask(request: CreateTaskRequest): Promise<string> {
    return await invoke("create_task", { request });
  },

  async getAllTasks(): Promise<TaskWithDetails[]> {
    return await invoke("get_all_tasks");
  },

  async updateTask(request: UpdateTaskRequest): Promise<void> {
    return await invoke("update_task", { request });
  },

  async deleteTask(taskId: string): Promise<void> {
    return await invoke("delete_task", { taskId });
  },

  async toggleTaskCompletion(
    taskId: string,
    completed: boolean
  ): Promise<void> {
    return await invoke("toggle_task_completion", { taskId, completed });
  },

  async toggleSubtaskCompletion(
    subtaskId: string,
    completed: boolean
  ): Promise<void> {
    return await invoke("toggle_subtask_completion", { subtaskId, completed });
  },
};

// Project operations
export const projectService = {
  async createProject(
    name: string,
    color: string,
    description: string | null,
    folderId: number | null
  ): Promise<void> {
    return await invoke("create_project", {
      name,
      color,
      description,
      folderId,
    });
  },

  async getAllProjects(): Promise<DatabaseProject[]> {
    return await invoke("get_all_projects");
  },

  async deleteProject(projectId: number): Promise<void> {
    return await invoke("delete_project", { projectId });
  },
};

// Folder operations
export const folderService = {
  async createFolder(
    name: string,
    color: string,
    description: string | null
  ): Promise<void> {
    return await invoke("create_folder", { name, color, description });
  },

  async getAllFolders(): Promise<DatabaseFolder[]> {
    return await invoke("get_all_folders");
  },

  async deleteFolder(folderId: number): Promise<void> {
    return await invoke("delete_folder", { folderId });
  },
};

// Tag operations
export const tagService = {
  async getAllTags(): Promise<string[]> {
    return await invoke("get_all_tags");
  },
};

// Settings operations
export const settingsService = {
  async setTheme(theme: string): Promise<void> {
    return await invoke("set_theme", { theme });
  },

  async getTheme(): Promise<string> {
    return await invoke("get_theme");
  },

  async saveSetting(key: string, value: string): Promise<void> {
    return await invoke("save_setting", { key, value });
  },

  async getSetting(key: string): Promise<string | null> {
    return await invoke("get_setting", { key });
  },
};

// Utility function to convert between frontend and backend task formats
export const convertToFrontendTask = (taskWithDetails: TaskWithDetails) => {
  return {
    id: taskWithDetails.task.id, // Keep string ID from backend
    title: taskWithDetails.task.title,
    description: taskWithDetails.task.description,
    dueDate: taskWithDetails.task.due_date || "",
    priority: taskWithDetails.task.priority as "low" | "medium" | "high",
    completed: taskWithDetails.task.completed,
    projectId: taskWithDetails.task.project_id || undefined,
    tags: taskWithDetails.tags,
    subtasks: taskWithDetails.subtasks.map((subtask) => ({
      id: subtask.id, // Keep string ID from backend
      text: subtask.text,
      completed: subtask.completed,
    })),
  };
};

export const convertToBackendTask = (frontendTask: any): CreateTaskRequest => {
  return {
    title: frontendTask.title,
    description: frontendTask.description,
    due_date: frontendTask.dueDate || null,
    priority: frontendTask.priority,
    project_id: frontendTask.projectId || null,
    subtasks: frontendTask.subtasks || [],
    tags: frontendTask.tags || [],
  };
};

// SearchBar Mode Types
export interface ParsedTask {
  title: string;
  description: string;
  due_date: string | null;
  priority: string;
  tags: string[];
  project_name: string | null;
}

// SearchBar Mode Functions
export const setSearchBarMode = async (
  mode: "search" | "create"
): Promise<void> => {
  try {
    await invoke("set_searchbar_mode", { mode });
  } catch (error) {
    console.error("Failed to set search bar mode:", error);
    throw error;
  }
};

export const getSearchBarMode = async (): Promise<"search" | "create"> => {
  try {
    const mode = await invoke<string>("get_searchbar_mode");
    return mode as "search" | "create";
  } catch (error) {
    console.error("Failed to get search bar mode:", error);
    return "search"; // Default fallback
  }
};

export const parseNaturalLanguageTask = async (
  input: string
): Promise<ParsedTask> => {
  try {
    const result = await invoke<ParsedTask>("parse_natural_language_task", {
      request: { input },
    });
    return result;
  } catch (error) {
    console.error("Failed to parse natural language task:", error);
    throw error;
  }
};

// Direct exports for convenience
export const createTask = taskService.createTask;
export const getAllTasks = taskService.getAllTasks;
export const updateTask = taskService.updateTask;
export const deleteTask = taskService.deleteTask;
