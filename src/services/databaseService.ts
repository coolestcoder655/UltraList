import { invoke } from "@tauri-apps/api/core";
import {
  debugTauriContext,
  logTauriDiagnostic,
  waitForTauriInitialization,
} from "../utils/tauriDebug";

// Utility function to check if we're in Tauri context
export const isInTauriContext = (): boolean => {
  try {
    // Primary check: if invoke function is available, we're likely in Tauri
    if (typeof invoke === "function") {
      return true;
    }

    // Fallback check: traditional __TAURI__ global check
    const diagnostic = debugTauriContext();
    return diagnostic.isInTauriContext;
  } catch (error) {
    console.error("Error checking Tauri context:", error);
    return false;
  }
};

// Enhanced invoke wrapper with Tauri initialization waiting
export const safeInvoke = async <T = any>(
  command: string,
  args?: Record<string, any>
): Promise<T> => {
  try {
    // Optimistic approach: try the command first if invoke function is available
    if (typeof invoke === "function") {
      try {
        console.log(`[DB] Attempting command: ${command}`, args);
        const result = await invoke<T>(command, args);
        console.log(`[DB] Command '${command}' completed successfully`);
        return result;
      } catch (invokeError) {
        // If the command fails, it might be because Tauri isn't fully ready
        console.log(
          `[DB] Direct invoke failed, checking Tauri initialization...`
        );
      }
    }

    // If direct invoke failed or isn't available, wait for full initialization
    console.log(
      `[DB] Waiting for Tauri initialization before retrying ${command}...`
    );
    const initialized = await waitForTauriInitialization(3000);

    if (!initialized && !isInTauriContext()) {
      logTauriDiagnostic();
      throw new Error(
        `NotInTauriContext: Cannot execute '${command}' - Tauri not available`
      );
    }

    // Retry the command after waiting
    console.log(`[DB] Retrying command after initialization: ${command}`, args);
    const result = await invoke<T>(command, args);
    console.log(`[DB] Command '${command}' completed successfully after retry`);
    return result;
  } catch (error) {
    console.error(`[DB] Command '${command}' failed:`, error);
    throw error;
  }
};

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
    return await safeInvoke<string>("create_task", { request });
  },

  async getAllTasks(): Promise<TaskWithDetails[]> {
    return await safeInvoke<TaskWithDetails[]>("get_all_tasks");
  },

  async updateTask(request: UpdateTaskRequest): Promise<void> {
    try {
      console.log("taskService.updateTask called with:", request);
      await safeInvoke<void>("update_task", { request });
      console.log("taskService.updateTask successful");
    } catch (error) {
      console.error("taskService.updateTask error:", error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    return await safeInvoke<void>("delete_task", { taskId });
  },

  async toggleTaskCompletion(
    taskId: string,
    completed: boolean
  ): Promise<void> {
    return await safeInvoke<void>("toggle_task_completion", {
      taskId,
      completed,
    });
  },

  async toggleSubtaskCompletion(
    subtaskId: string,
    completed: boolean
  ): Promise<void> {
    return await safeInvoke<void>("toggle_subtask_completion", {
      subtaskId,
      completed,
    });
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
    return await safeInvoke<void>("create_project", {
      name,
      color,
      description,
      folderId,
    });
  },

  async getAllProjects(): Promise<DatabaseProject[]> {
    return await safeInvoke<DatabaseProject[]>("get_all_projects");
  },

  async deleteProject(projectId: number): Promise<void> {
    return await safeInvoke<void>("delete_project", { projectId });
  },
};

// Folder operations
export const folderService = {
  async createFolder(
    name: string,
    color: string,
    description: string | null
  ): Promise<void> {
    return await safeInvoke<void>("create_folder", {
      name,
      color,
      description,
    });
  },

  async getAllFolders(): Promise<DatabaseFolder[]> {
    return await safeInvoke<DatabaseFolder[]>("get_all_folders");
  },

  async deleteFolder(folderId: number): Promise<void> {
    return await safeInvoke<void>("delete_folder", { folderId });
  },
};

// Tag operations
export const tagService = {
  async getAllTags(): Promise<string[]> {
    return await safeInvoke<string[]>("get_all_tags");
  },
};

// Settings operations
export const settingsService = {
  async setTheme(theme: string): Promise<void> {
    return await safeInvoke<void>("set_theme", { theme });
  },

  async getTheme(): Promise<string> {
    return await safeInvoke<string>("get_theme");
  },

  async saveSetting(key: string, value: string): Promise<void> {
    return await safeInvoke<void>("save_setting", { key, value });
  },

  async getSetting(key: string): Promise<string | null> {
    return await safeInvoke<string | null>("get_setting", { key });
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
