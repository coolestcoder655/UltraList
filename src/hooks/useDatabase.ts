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

      // Check if we're in Tauri context
      const isInTauri = typeof window !== "undefined" && "__TAURI__" in window;

      console.log("=== DATABASE LOAD DEBUG ===");
      console.log("isInTauri:", isInTauri);
      console.log(
        "window.__TAURI__:",
        typeof window !== "undefined"
          ? !!(window as any).__TAURI__
          : "no window"
      );

      if (!isInTauri) {
        console.log("Using demo data (not in Tauri context)");
        // Provide demo data for web browser testing
        const demoTasks: Task[] = [
          {
            id: "1",
            title: "Design new user interface",
            description: "Create mockups and wireframes for the new dashboard",
            dueDate: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000
            ).toISOString(), // 2 days from now
            priority: "high",
            completed: false,
            subtasks: [
              {
                id: "1-1",
                text: "Research competitor interfaces",
                completed: true,
              },
              { id: "1-2", text: "Create initial sketches", completed: false },
              {
                id: "1-3",
                text: "Design high-fidelity mockups",
                completed: false,
              },
            ],
            projectId: 1,
            tags: ["design", "urgent", "ui"],
          },
          {
            id: "2",
            title: "Implement authentication system",
            description: "Set up user login and registration functionality",
            dueDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(), // 1 week from now
            priority: "high",
            completed: false,
            subtasks: [
              { id: "2-1", text: "Set up database schema", completed: true },
              { id: "2-2", text: "Create login form", completed: true },
              {
                id: "2-3",
                text: "Implement password hashing",
                completed: false,
              },
            ],
            projectId: 1,
            tags: ["backend", "security"],
          },
          {
            id: "3",
            title: "Write documentation",
            description: "Document the API endpoints and usage examples",
            dueDate: new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000
            ).toISOString(), // 2 weeks from now
            priority: "medium",
            completed: false,
            subtasks: [],
            projectId: 2,
            tags: ["docs", "api"],
          },
          {
            id: "4",
            title: "Fix mobile responsiveness",
            description: "Ensure the app works well on mobile devices",
            dueDate: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(), // 1 day ago (overdue)
            priority: "medium",
            completed: false,
            subtasks: [
              { id: "4-1", text: "Test on iOS", completed: false },
              { id: "4-2", text: "Test on Android", completed: false },
            ],
            tags: ["mobile", "responsive"],
          },
          {
            id: "5",
            title: "Prepare presentation slides",
            description: "Create slides for the quarterly review meeting",
            dueDate: new Date(
              Date.now() + 1 * 24 * 60 * 60 * 1000
            ).toISOString(), // Tomorrow
            priority: "low",
            completed: false,
            subtasks: [],
            tags: ["presentation", "meeting"],
          },
          {
            id: "6",
            title: "Code review",
            description: "Review pull requests from team members",
            dueDate: "",
            priority: "low",
            completed: true,
            subtasks: [
              { id: "6-1", text: "Review PR #123", completed: true },
              { id: "6-2", text: "Review PR #124", completed: true },
            ],
            projectId: 1,
            tags: ["review", "team"],
          },
        ];

        const demoProjects: Project[] = [
          {
            id: 1,
            name: "UltraList App",
            color: "bg-blue-500",
            description: "Main productivity application development",
            folderId: 1,
          },
          {
            id: 2,
            name: "Documentation",
            color: "bg-green-500",
            description: "User guides and API documentation",
          },
        ];

        const demoFolders: Folder[] = [
          {
            id: 1,
            name: "Active Projects",
            color: "bg-purple-500",
            description: "Currently active development projects",
          },
        ];

        const demoTags = [
          "design",
          "urgent",
          "ui",
          "backend",
          "security",
          "docs",
          "api",
          "mobile",
          "responsive",
          "presentation",
          "meeting",
          "review",
          "team",
        ];

        setTasks(demoTasks);
        setProjects(demoProjects);
        setFolders(demoFolders);
        setTags(demoTags);
        setTheme("light");
        setLoading(false);
        return;
      }

      console.log("Loading data from real database...");

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
      console.log(
        "First converted task subtasks:",
        convertedTasks[0]?.subtasks
      );
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
