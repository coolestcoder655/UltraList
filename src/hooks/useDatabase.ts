import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  taskService,
  projectService,
  folderService,
  tagService,
  settingsService,
  convertToFrontendTask,
  convertToBackendTask,
  isInTauriContext,
  type TaskWithDetails,
  type DatabaseProject,
  type DatabaseFolder,
} from "../services/databaseService";
import { waitForTauriInitialization } from "../utils/tauriDebug";
import type { Task, Project, Folder } from "../types";

export const useDatabase = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data from database
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Enhanced context checking with multiple approaches
      console.log("=== DATABASE LOAD DEBUG ===");
      console.log("invoke function available:", typeof invoke === "function");
      console.log(
        "window.__TAURI__ available:",
        typeof window !== "undefined"
          ? !!(window as any).__TAURI__
          : "no window"
      );

      // Try optimistic approach first - if invoke is available, try it
      if (typeof invoke === "function") {
        console.log(
          "Invoke function available, attempting database operations..."
        );
        try {
          await attemptDataLoad();
          return; // Success!
        } catch (error) {
          console.log(
            "Optimistic load failed, will wait for full initialization:",
            error
          );
        }
      }

      // If optimistic approach failed, wait for full Tauri initialization
      console.log("Waiting for complete Tauri initialization...");
      const initialized = await waitForTauriInitialization(5000);

      if (!initialized) {
        throw new Error("Tauri initialization timeout");
      }

      // Try again after waiting
      await attemptDataLoad();
    } catch (err) {
      console.error("Database error:", err);
      setError("Error accessing data - database connection failed");
      setTasks([]);
      setProjects([]);
      setFolders([]);
      setTags([]);
      setTheme("light");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function for the actual data loading
  const attemptDataLoad = useCallback(async () => {
    console.log("Loading data from database...");

    const [tasksData, projectsData, foldersData, tagsData, themeData]: [
      TaskWithDetails[],
      DatabaseProject[],
      DatabaseFolder[],
      string[],
      string
    ] = await Promise.all([
      taskService.getAllTasks(),
      projectService.getAllProjects(),
      folderService.getAllFolders(),
      tagService.getAllTags(),
      settingsService.getTheme(),
    ]);

    console.log("Raw tasks data from database:", tasksData);
    console.log("First task subtasks:", tasksData[0]?.subtasks);

    // Convert backend data to frontend format
    const convertedTasks = tasksData.map(convertToFrontendTask);

    console.log("Converted tasks:", convertedTasks);
    console.log("First converted task subtasks:", convertedTasks[0]?.subtasks);

    const convertedProjects: Project[] = projectsData.map(
      (p: DatabaseProject) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        description: p.description || undefined,
        folderId: p.folder_id || undefined,
      })
    );

    const convertedFolders: Folder[] = foldersData.map((f: DatabaseFolder) => ({
      id: f.id,
      name: f.name,
      color: f.color,
      description: f.description || undefined,
    }));

    setTasks(convertedTasks);
    setProjects(convertedProjects);
    setFolders(convertedFolders);
    setTags(tagsData);
    setTheme(themeData as "light" | "dark");

    console.log("Database load completed successfully");
  }, []);

  // Initialize data on component mount with simpler, more aggressive approach
  useEffect(() => {
    const initializeDatabase = async () => {
      console.log("[DB] Starting database initialization...");

      // Try immediate load first (optimistic approach)
      try {
        await loadAllData();
      } catch (error) {
        console.warn("[DB] Initial load failed, will retry...", error);

        // If that fails, wait a bit and try again
        setTimeout(async () => {
          try {
            await loadAllData();
          } catch (retryError) {
            console.error("[DB] Retry also failed:", retryError);
          }
        }, 1000);
      }
    };

    initializeDatabase();
  }, [loadAllData]);

  // Task operations
  const createTask = useCallback(
    async (taskData: any) => {
      try {
        console.log("useDatabase.createTask called with:", taskData);
        setError(null);

        // Check if we're in Tauri context using centralized function
        if (!isInTauriContext()) {
          setError(
            "Error accessing data - application must be run in desktop mode"
          );
          throw new Error(
            "Database not available - not running in Tauri context"
          );
        }

        const backendTask = convertToBackendTask(taskData);
        console.log("Converted to backend format:", backendTask);
        const taskId = await taskService.createTask(backendTask);
        console.log("Backend returned task ID:", taskId);
        await loadAllData(); // Reload all data to get the new task
        return taskId;
      } catch (err) {
        console.error("Error in useDatabase.createTask:", err);
        setError("Error accessing data - failed to create task");
        throw err;
      }
    },
    [loadAllData]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: any) => {
      try {
        setError(null);

        console.log("=== UPDATE TASK DEBUG ===");
        console.log("isInTauriContext():", isInTauriContext());
        console.log("taskService:", taskService);
        console.log("taskService.updateTask:", taskService.updateTask);

        // Use centralized Tauri context check
        if (!isInTauriContext()) {
          setError(
            "Error accessing data - application must be run in desktop mode"
          );
          throw new Error(
            "Database not available - not running in Tauri context"
          );
        }

        // Prepare the request object with proper type handling
        const updateRequest: any = {
          id: taskId,
        };

        // Only include fields that are actually being updated
        if (updates.title !== undefined) updateRequest.title = updates.title;
        if (updates.description !== undefined)
          updateRequest.description = updates.description;
        if (updates.dueDate !== undefined) {
          updateRequest.due_date = updates.dueDate || null;
        }
        if (updates.priority !== undefined)
          updateRequest.priority = updates.priority;
        if (updates.projectId !== undefined) {
          updateRequest.project_id = updates.projectId || null;
        }
        if (updates.completed !== undefined)
          updateRequest.completed = updates.completed;
        if (updates.subtasks !== undefined) {
          updateRequest.subtasks = Array.isArray(updates.subtasks)
            ? updates.subtasks.map((st: any) =>
                typeof st === "string" ? st : st.text
              )
            : [];
        }
        if (updates.tags !== undefined) {
          updateRequest.tags = Array.isArray(updates.tags) ? updates.tags : [];
        }

        console.log("Attempting Tauri updateTask with request:", updateRequest);
        await taskService.updateTask(updateRequest);
        console.log("Tauri updateTask successful, reloading data...");
        await loadAllData(); // Reload all data to get the updated task
      } catch (err) {
        console.error("Final updateTask error:", err);
        setError("Error accessing data - failed to update task");
        throw err;
      }
    },
    [loadAllData]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        setError(null);

        // Use centralized Tauri context check
        if (!isInTauriContext()) {
          setError(
            "Error accessing data - application must be run in desktop mode"
          );
          throw new Error(
            "Database not available - not running in Tauri context"
          );
        }

        await taskService.deleteTask(taskId);
        await loadAllData(); // Reload all data to remove the deleted task
      } catch (err) {
        setError("Error accessing data - failed to delete task");
        throw err;
      }
    },
    [loadAllData]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string, completed: boolean) => {
      try {
        setError(null);

        // Use centralized Tauri context check
        if (!isInTauriContext()) {
          setError(
            "Error accessing data - application must be run in desktop mode"
          );
          throw new Error(
            "Database not available - not running in Tauri context"
          );
        }

        await taskService.toggleTaskCompletion(taskId, completed);
        await loadAllData(); // Reload all data to get the updated task
      } catch (err) {
        setError("Error accessing data - failed to toggle task completion");
        throw err;
      }
    },
    [loadAllData]
  );

  const toggleSubtaskCompletion = useCallback(
    async (subtaskId: string, completed: boolean) => {
      try {
        setError(null);

        // Use centralized Tauri context check
        if (!isInTauriContext()) {
          setError(
            "Error accessing data - application must be run in desktop mode"
          );
          throw new Error(
            "Database not available - not running in Tauri context"
          );
        }

        await taskService.toggleSubtaskCompletion(subtaskId, completed);
        await loadAllData(); // Reload all data to get the updated subtask
      } catch (err) {
        setError("Error accessing data - failed to toggle subtask completion");
        throw err;
      }
    },
    [loadAllData]
  );

  // Project operations
  const createProject = useCallback(
    async (
      name: string,
      color: string,
      description?: string,
      folderId?: number
    ) => {
      try {
        setError(null);

        // Check if we're in Tauri context
        const isInTauri =
          typeof window !== "undefined" && "__TAURI__" in window;

        if (!isInTauri) {
          setError(
            "Error accessing data - application must be run in desktop mode"
          );
          throw new Error(
            "Database not available - not running in Tauri context"
          );
        }

        await projectService.createProject(
          name,
          color,
          description || null,
          folderId || null
        );
        await loadAllData();
      } catch (err) {
        setError("Error accessing data - failed to create project");
        throw err;
      }
    },
    [loadAllData]
  );

  const deleteProject = useCallback(
    async (projectId: number) => {
      try {
        setError(null);

        // Check if we're in Tauri context
        const isInTauri =
          typeof window !== "undefined" && "__TAURI__" in window;

        if (!isInTauri) {
          setError(
            "Error accessing data - application must be run in desktop mode"
          );
          throw new Error(
            "Database not available - not running in Tauri context"
          );
        }

        await projectService.deleteProject(projectId);
        await loadAllData();
      } catch (err) {
        setError("Error accessing data - failed to delete project");
        throw err;
      }
    },
    [loadAllData]
  );

  // Folder operations
  const createFolder = useCallback(
    async (name: string, color: string, description?: string) => {
      try {
        setError(null);

        // Check if we're in Tauri context
        const isInTauri =
          typeof window !== "undefined" && "__TAURI__" in window;

        if (!isInTauri) {
          setError(
            "Error accessing data - application must be run in desktop mode"
          );
          throw new Error(
            "Database not available - not running in Tauri context"
          );
        }

        await folderService.createFolder(name, color, description || null);
        await loadAllData();
      } catch (err) {
        setError("Error accessing data - failed to create folder");
        throw err;
      }
    },
    [loadAllData]
  );

  const deleteFolder = useCallback(
    async (folderId: number) => {
      try {
        setError(null);

        // Check if we're in Tauri context
        const isInTauri =
          typeof window !== "undefined" && "__TAURI__" in window;

        if (!isInTauri) {
          setError(
            "Error accessing data - application must be run in desktop mode"
          );
          throw new Error(
            "Database not available - not running in Tauri context"
          );
        }

        await folderService.deleteFolder(folderId);
        await loadAllData();
      } catch (err) {
        setError("Error accessing data - failed to delete folder");
        throw err;
      }
    },
    [loadAllData]
  );

  // Theme operations
  const updateTheme = useCallback(async (newTheme: "light" | "dark") => {
    try {
      setError(null);

      // Check if we're in Tauri context
      const isInTauri = typeof window !== "undefined" && "__TAURI__" in window;

      if (!isInTauri) {
        setError(
          "Error accessing data - application must be run in desktop mode"
        );
        throw new Error(
          "Database not available - not running in Tauri context"
        );
      }

      await settingsService.setTheme(newTheme);
      setTheme(newTheme);
    } catch (err) {
      setError("Error accessing data - failed to update theme");
      throw err;
    }
  }, []);

  // Settings operations
  const saveSetting = useCallback(async (key: string, value: string) => {
    try {
      setError(null);
      await settingsService.saveSetting(key, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save setting");
      throw err;
    }
  }, []);

  const getSetting = useCallback(async (key: string) => {
    try {
      setError(null);
      return await settingsService.getSetting(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get setting");
      throw err;
    }
  }, []);

  return {
    // Data
    tasks,
    projects,
    folders,
    tags,
    theme,
    loading,
    error,

    // Task operations
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,

    // Project operations
    createProject,
    deleteProject,

    // Folder operations
    createFolder,
    deleteFolder,

    // Theme operations
    updateTheme,

    // Settings operations
    saveSetting,
    getSetting,

    // Utility operations
    refreshData: loadAllData,
  };
};
