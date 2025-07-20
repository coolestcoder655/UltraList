import { useState, useEffect, useCallback } from "react";
import {
  taskService,
  projectService,
  folderService,
  tagService,
  settingsService,
  convertToFrontendTask,
  convertToBackendTask,
  type TaskWithDetails,
  type DatabaseProject,
  type DatabaseFolder,
} from "../services/databaseService";
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

      // Convert backend data to frontend format
      const convertedTasks = tasksData.map(convertToFrontendTask);
      const convertedProjects: Project[] = projectsData.map(
        (p: DatabaseProject) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          description: p.description || undefined,
          folderId: p.folder_id || undefined,
        })
      );
      const convertedFolders: Folder[] = foldersData.map(
        (f: DatabaseFolder) => ({
          id: f.id,
          name: f.name,
          color: f.color,
          description: f.description || undefined,
        })
      );

      setTasks(convertedTasks);
      setProjects(convertedProjects);
      setFolders(convertedFolders);
      setTags(tagsData);
      setTheme(themeData as "light" | "dark");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Task operations
  const createTask = useCallback(
    async (taskData: any) => {
      try {
        console.log("useDatabase.createTask called with:", taskData);
        setError(null);
        const backendTask = convertToBackendTask(taskData);
        console.log("Converted to backend format:", backendTask);
        const taskId = await taskService.createTask(backendTask);
        console.log("Backend returned task ID:", taskId);
        await loadAllData(); // Reload all data to get the new task
        return taskId;
      } catch (err) {
        console.error("Error in useDatabase.createTask:", err);
        setError(err instanceof Error ? err.message : "Failed to create task");
        throw err;
      }
    },
    [loadAllData]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: any) => {
      try {
        setError(null);

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

        await taskService.updateTask(updateRequest);
        await loadAllData(); // Reload all data to get the updated task
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task");
        throw err;
      }
    },
    [loadAllData]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        setError(null);
        await taskService.deleteTask(taskId);
        await loadAllData(); // Reload all data to remove the deleted task
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete task");
        throw err;
      }
    },
    [loadAllData]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string, completed: boolean) => {
      try {
        setError(null);
        await taskService.toggleTaskCompletion(taskId, completed);
        await loadAllData(); // Reload all data to get the updated task
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to toggle task completion"
        );
        throw err;
      }
    },
    [loadAllData]
  );

  const toggleSubtaskCompletion = useCallback(
    async (subtaskId: string, completed: boolean) => {
      try {
        setError(null);
        await taskService.toggleSubtaskCompletion(subtaskId, completed);
        await loadAllData(); // Reload all data to get the updated subtask
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to toggle subtask completion"
        );
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
        await projectService.createProject(
          name,
          color,
          description || null,
          folderId || null
        );
        await loadAllData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create project"
        );
        throw err;
      }
    },
    [loadAllData]
  );

  const deleteProject = useCallback(
    async (projectId: number) => {
      try {
        setError(null);
        await projectService.deleteProject(projectId);
        await loadAllData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete project"
        );
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
        await folderService.createFolder(name, color, description || null);
        await loadAllData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create folder"
        );
        throw err;
      }
    },
    [loadAllData]
  );

  const deleteFolder = useCallback(
    async (folderId: number) => {
      try {
        setError(null);
        await folderService.deleteFolder(folderId);
        await loadAllData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete folder"
        );
        throw err;
      }
    },
    [loadAllData]
  );

  // Theme operations
  const updateTheme = useCallback(async (newTheme: "light" | "dark") => {
    try {
      setError(null);
      await settingsService.setTheme(newTheme);
      setTheme(newTheme);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update theme");
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
