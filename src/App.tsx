import { useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import AddTaskForm from "./components/AddTaskForm";
import ProjectManagement from "./components/ProjectManagement";
import TaskList from "./components/TaskList";
import KanbanView from "./components/KanbanView";
import GanttView from "./components/GanttView";
import EisenhowerView from "./components/EisenhowerView";
import PomodoroView from "./components/PomodoroView";
import ConfirmationModal from "./components/ConfirmationModal";
import {
  useTheme,
  useTemplates,
  useTaskForm,
  useTaskFiltering,
  useDatabase,
} from "./hooks";
import { initialTemplates } from "./data/initialData";
import { logsService } from "./services/logsService";
import { logTauriDiagnostic, testTauriConnection } from "./utils/tauriDebug";
import type { Task as TaskType, Subtask, ViewMode } from "./types";
import "./App.css";

const App = (): JSX.Element => {
  // Database integration - replaces useTasks and useProjectsAndFolders
  const {
    tasks,
    projects,
    folders,
    theme,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    createProject,
    deleteProject,
    createFolder,
    deleteFolder,
    updateTheme,
  } = useDatabase();

  // Custom hooks (keeping existing ones that don't conflict)
  const { getTagColor, priorityColors } = useTheme();
  const { templates, addTemplate, deleteTemplate } =
    useTemplates(initialTemplates);
  const {
    newTask,
    setNewTask,
    editingTask,
    setEditingTask,
    newSubtask,
    setNewSubtask,
    newTag,
    setNewTag,
    parseResult,
    showParseSuggestions,
    resetNewTask,
    addSubtaskToNewTask,
    removeSubtaskFromNewTask,
    addTagToNewTask,
    removeTagFromNewTask,
    applyTemplate: applyTemplateToForm,
    parseNaturalLanguage,
    applyParsedData,
    dismissParseSuggestions,
  } = useTaskForm();
  const {
    searchQuery,
    setSearchQuery,
    expandedTasks,
    toggleExpanded,
    parseSearchQuery,
    getFilteredAndSortedTasks,
  } = useTaskFiltering();

  // UI state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showProjectForm, setShowProjectForm] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [devMode, setDevMode] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    color: "bg-blue-500",
    description: "",
    folderId: undefined as number | undefined,
  });
  const [newFolder, setNewFolder] = useState({
    name: "",
    color: "bg-gray-500",
    description: "",
  });
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingFolder, setEditingFolder] = useState<any>(null);

  // Task management functions
  const handleAddTask = async (): Promise<void> => {
    if (!newTask.title.trim()) return;

    console.log("Creating task with data:", newTask);

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        projectId: newTask.projectId,
        subtasks: newTask.subtasks,
        tags: newTask.tags,
      };

      console.log("Converted task data:", taskData);

      const result = await createTask(taskData);
      console.log("Task created successfully with ID:", result);

      resetNewTask();
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      // Show user-friendly error message
      alert(
        `Failed to create task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const startEdit = (task: TaskType): void => {
    // Create a deep copy to avoid reference issues
    setEditingTask({
      ...task,
      subtasks: task.subtasks.map((st: Subtask) => st.text),
    });
  };

  const saveEdit = async (): Promise<void> => {
    if (!editingTask?.title.trim()) return;

    try {
      // Check if the task still exists in the current tasks list
      const currentTask = tasks.find((t) => t.id === editingTask.id);
      if (!currentTask) {
        console.error("Task no longer exists, canceling edit");
        setEditingTask(null);
        return;
      }

      await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
        priority: editingTask.priority,
        projectId: editingTask.projectId,
        subtasks: editingTask.subtasks,
        tags: editingTask.tags,
      });
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
      // Reset editing task on failure to prevent further issues
      setEditingTask(null);
    }
  };

  // Template functions
  const applyTemplate = (templateId: number): void => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    applyTemplateToForm(template);
  };

  const saveAsTemplate = (): void => {
    if (!newTask.title.trim()) return;
    addTemplate({
      name: `Template: ${newTask.title}`,
      description: `Auto-generated from task`,
      defaultTitle: newTask.title,
      defaultDescription: newTask.description,
      defaultPriority: newTask.priority,
      defaultSubtasks: [...newTask.subtasks],
      defaultProjectId: newTask.projectId,
      defaultTags: [...newTask.tags],
    });
  };

  // Project and Folder management functions
  const addProject = async (): Promise<void> => {
    if (!newProject.name.trim()) return;
    try {
      await createProject(
        newProject.name,
        newProject.color,
        newProject.description,
        newProject.folderId
      );
      setNewProject({
        name: "",
        color: "bg-blue-500",
        description: "",
        folderId: undefined,
      });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteProject = async (id: number): Promise<void> => {
    try {
      await deleteProject(id);
      // Also remove this project from any tasks
      tasks.forEach(async (task) => {
        if (task.projectId === id) {
          await updateTask(task.id.toString(), { projectId: undefined });
        }
      });
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const addFolder = async (): Promise<void> => {
    if (!newFolder.name.trim()) return;
    try {
      await createFolder(
        newFolder.name,
        newFolder.color,
        newFolder.description
      );
      setNewFolder({ name: "", color: "bg-gray-500", description: "" });
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleDeleteFolder = async (id: number): Promise<void> => {
    try {
      await deleteFolder(id);
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  // Helper functions
  const getProjectById = (id: number) => projects.find((p) => p.id === id);
  const getFolderById = (id: number) => folders.find((f) => f.id === id);

  // Utility functions for tasks
  const isOverdue = (dateString: string): boolean => {
    if (!dateString) return false;
    try {
      const taskDate = new Date(dateString);
      const today = new Date();
      taskDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return taskDate < today;
    } catch {
      return false;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleToggleTask = async (id: string): Promise<void> => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      try {
        await toggleTaskCompletion(task.id, !task.completed);
      } catch (error) {
        console.error("Failed to toggle task:", error);
      }
    }
  };

  const handleToggleSubtask = async (
    taskId: string,
    subtaskId: string
  ): Promise<void> => {
    console.log("=== SUBTASK TOGGLE DEBUG ===");
    console.log("handleToggleSubtask called with:", { taskId, subtaskId });
    console.log(
      "All tasks:",
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        subtaskCount: t.subtasks.length,
      }))
    );

    const task = tasks.find((t) => t.id === taskId);
    console.log("Found task:", task ? task.title : "null");

    if (task) {
      console.log(
        "Task subtasks:",
        task.subtasks.map((st) => ({
          id: st.id,
          text: st.text,
          completed: st.completed,
        }))
      );
      const subtask = task.subtasks.find((st) => st.id === subtaskId);
      console.log("Found subtask:", subtask);

      if (subtask) {
        console.log("Subtask details:", {
          id: subtask.id,
          text: subtask.text,
          currentCompletion: subtask.completed,
        });
        console.log("Will call toggleSubtaskCompletion with:", {
          subtaskId: subtask.id,
          newCompletion: !subtask.completed,
        });
        try {
          await toggleSubtaskCompletion(subtask.id, !subtask.completed);
          console.log("Successfully toggled subtask completion");
        } catch (error) {
          console.error("Failed to toggle subtask:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
        }
      } else {
        console.error("Subtask not found in task:", subtaskId);
        console.error(
          "Available subtask IDs:",
          task.subtasks.map((st) => st.id)
        );
      }
    } else {
      console.error("Task not found:", taskId);
      console.error(
        "Available task IDs:",
        tasks.map((t) => t.id)
      );
    }
    console.log("=== END SUBTASK TOGGLE DEBUG ===");
  };

  const handleDeleteTask = (id: string): void => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setTaskToDelete({ id: task.id, title: task.title });
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDeleteTask = async (): Promise<void> => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      setShowDeleteConfirmation(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const cancelDeleteTask = (): void => {
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
  };

  // Use database theme instead of local state
  const isDarkMode = theme === "dark";
  const toggleDarkMode = async () => {
    try {
      await updateTheme(isDarkMode ? "light" : "dark");
    } catch (error) {
      console.error("Failed to toggle theme:", error);
    }
  };

  // Handle view logs
  const handleViewLogs = async () => {
    try {
      await logsService.openLogsWindow();
    } catch (error) {
      console.error("Failed to open logs window:", error);
    }
  };

  // Handle Tauri diagnostic
  const handleTauriDiagnostic = async () => {
    console.clear();
    console.log("🔧 Running Enhanced Tauri Diagnostic v2...");
    console.log("📝 Changes made to fix false 'web mode' detection:");
    console.log("  • More lenient context detection (invoke function = Tauri likely available)");
    console.log("  • Optimistic command execution before waiting");
    console.log("  • Better error messages without assuming 'web mode'");
    console.log("  • Aggressive retry logic");
    console.log("");

    // First attempt - immediate check
    console.log("📊 Immediate diagnostic:");
    logTauriDiagnostic();

    // Second attempt - after waiting for initialization
    console.log("⏳ Testing connection with new optimistic approach...");
    const connectionResult = await testTauriConnection();

    if (connectionResult) {
      console.log("✅ All Tauri diagnostics passed!");
      console.log("🎉 The false 'web mode' detection should now be fixed!");
      console.log("💡 If you're still seeing database errors, try refreshing the page");
    } else {
      console.error("❌ Tauri diagnostic failed - this indicates a real issue");
      console.log("🔧 Advanced troubleshooting:");
      console.log("1. Check if Rust backend compiled without errors");
      console.log("2. Verify all Tauri commands are registered in lib.rs");
      console.log("3. Look for Rust compilation errors in the terminal");
      console.log("4. Try completely restarting 'npm run tauri dev'");
    }
  };

  // Get filtered and sorted tasks
  const sortedTasks = getFilteredAndSortedTasks(tasks, getProjectById);

  // Show loading state while database is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading UltraList...</p>
        </div>
      </div>
    );
  }

  // Show error state if database fails to initialize
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Unable to Access Data</p>
          <p className="text-sm">{error}</p>
          <div
            className={`mt-6 p-4 rounded-lg border shadow-sm ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <p
              className={`text-sm mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <span className="font-semibold">Troubleshooting Tips:</span>
            </p>
            <ul
              className={`list-disc list-inside text-xs mb-2 space-y-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <li>
                Make sure UltraList is running in{" "}
                <span className="font-medium">desktop mode</span>.
              </li>
              <li>Try restarting the application if the problem persists.</li>
              <li>Check your internet connection and system permissions.</li>
            </ul>
            <p
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              If you continue to see this error, please open an issue on our{" "}
              <a
                href="https://github.com/coolestcoder655/UltraList"
                className={`underline hover:text-blue-700 dark:hover:text-blue-300 ${
                  isDarkMode ? "text-blue-400" : "text-blue-500"
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub repository
              </a>
              <span
                className={`block mt-2 text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isDarkMode
                  ? "You are using UltraList in dark mode."
                  : "You are using UltraList in light mode."}
              </span>{" "}
              with details about your environment and steps to reproduce the
              issue.
            </p>
          </div>
        </div>

        {/* Developer Debug Logs Button for Error State */}
        <div className="fixed bottom-4 right-4 flex gap-2">
          <button
            onClick={handleTauriDiagnostic}
            className="px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-600 hover:bg-red-500 text-white focus:ring-red-500"
            title="Run Tauri context diagnostic (check console - F12)"
          >
            <svg
              className="w-4 h-4 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Diagnose
          </button>
          <button
            onClick={handleViewLogs}
            className="px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700 hover:bg-gray-600 text-gray-300 focus:ring-gray-500"
            title="Open developer debug logs (for debugging and troubleshooting)"
          >
            <svg
              className="w-4 h-4 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Debug Logs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ease-in-out ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="h-full">
        <div
          className={`h-full transition-all duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <Header
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            devMode={devMode}
            onToggleDevMode={() => setDevMode(!devMode)}
            onShowAddForm={() => setShowAddForm(!showAddForm)}
            onShowProjectForm={() => setShowProjectForm(!showProjectForm)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div
            className={`p-4 sm:p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
          >
            {/* Search and Filters - Only show for list view */}
            {viewMode === "list" && (
              <div className="space-y-4 mb-6 animate-fadeIn">
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  parseSearchQuery={parseSearchQuery}
                  isDarkMode={isDarkMode}
                  tasks={tasks}
                  projects={projects}
                  onTaskCreated={() => {
                    // Task list will automatically refresh due to useDatabase hook
                    console.log("Task created successfully!");
                  }}
                />
              </div>
            )}

            {/* Add Task Form */}
            <AddTaskForm
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
              newTask={newTask}
              setNewTask={setNewTask}
              newSubtask={newSubtask}
              setNewSubtask={setNewSubtask}
              newTag={newTag}
              setNewTag={setNewTag}
              templates={templates}
              projects={projects}
              folders={folders}
              parseResult={parseResult}
              showParseSuggestions={showParseSuggestions}
              onApplyTemplate={applyTemplate}
              onAddTask={handleAddTask}
              onSaveAsTemplate={saveAsTemplate}
              onAddSubtaskToNewTask={addSubtaskToNewTask}
              onRemoveSubtaskFromNewTask={removeSubtaskFromNewTask}
              onAddTagToNewTask={addTagToNewTask}
              onRemoveTagFromNewTask={removeTagFromNewTask}
              onDeleteTemplate={deleteTemplate}
              onParseNaturalLanguage={parseNaturalLanguage}
              onApplyParsedData={applyParsedData}
              onDismissParseSuggestions={dismissParseSuggestions}
              getTagColor={getTagColor}
              isDarkMode={isDarkMode}
            />

            {/* Project Management Form */}
            <ProjectManagement
              showProjectForm={showProjectForm}
              setShowProjectForm={setShowProjectForm}
              newProject={newProject}
              setNewProject={setNewProject}
              newFolder={newFolder}
              setNewFolder={setNewFolder}
              projects={projects}
              folders={folders}
              editingProject={editingProject}
              setEditingProject={setEditingProject}
              editingFolder={editingFolder}
              setEditingFolder={setEditingFolder}
              onAddProject={addProject}
              onUpdateProject={() => {}} // TODO: Implement updateProject
              onDeleteProject={handleDeleteProject}
              onAddFolder={addFolder}
              onUpdateFolder={() => {}} // TODO: Implement updateFolder
              onDeleteFolder={handleDeleteFolder}
              getFolderById={getFolderById}
              isDarkMode={isDarkMode}
            />

            {/* Main Content - Switch between different views */}
            {viewMode === "list" && (
              <TaskList
                tasks={sortedTasks}
                editingTask={editingTask}
                expandedTasks={expandedTasks}
                priorityColors={priorityColors}
                isDarkMode={isDarkMode}
                projects={projects}
                onToggleTask={handleToggleTask}
                onToggleSubtask={handleToggleSubtask}
                onToggleExpanded={toggleExpanded}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingTask(null)}
                onEditingTaskChange={setEditingTask}
                onDeleteTask={handleDeleteTask}
                formatDate={formatDate}
                isOverdue={isOverdue}
                getTagColor={getTagColor}
              />
            )}

            {viewMode === "kanban" && (
              <KanbanView
                tasks={sortedTasks}
                projects={projects}
                isDarkMode={isDarkMode}
                onToggleTask={handleToggleTask}
                onStartEdit={startEdit}
                onDeleteTask={handleDeleteTask}
                formatDate={formatDate}
                isOverdue={isOverdue}
                getTagColor={getTagColor}
                priorityColors={priorityColors}
              />
            )}

            {viewMode === "gantt" && (
              <GanttView
                tasks={sortedTasks}
                projects={projects}
                isDarkMode={isDarkMode}
                onStartEdit={startEdit}
                formatDate={formatDate}
                isOverdue={isOverdue}
                getTagColor={getTagColor}
                priorityColors={priorityColors}
              />
            )}

            {viewMode === "eisenhower" && (
              <EisenhowerView
                tasks={sortedTasks}
                projects={projects}
                isDarkMode={isDarkMode}
                onStartEdit={startEdit}
                onToggleTask={handleToggleTask}
                formatDate={formatDate}
                isOverdue={isOverdue}
                getTagColor={getTagColor}
                priorityColors={priorityColors}
              />
            )}

            {viewMode === "pomodoro" && (
              <PomodoroView
                tasks={sortedTasks}
                projects={projects}
                isDarkMode={isDarkMode}
                onStartEdit={startEdit}
                onToggleSubtask={handleToggleSubtask}
                getTagColor={getTagColor}
                priorityColors={priorityColors}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        isDarkMode={isDarkMode}
        isDestructive={true}
      />

      {/* Developer Debug Buttons - Show when there's an error OR dev mode is enabled */}
      {(error || devMode) && (
        <div className="fixed bottom-4 right-4 flex gap-2">
        <button
          onClick={handleTauriDiagnostic}
          className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDarkMode
              ? "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500"
              : "bg-red-500 hover:bg-red-400 text-white focus:ring-red-300"
          }`}
          title="Run Tauri context diagnostic (check console - F12)"
        >
          <svg
            className="w-4 h-4 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Diagnose
        </button>
        <button
          onClick={handleViewLogs}
          className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300 focus:ring-gray-500"
              : "bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-300 border border-gray-200"
          }`}
          title="Open developer debug logs (for debugging and troubleshooting)"
        >
          <svg
            className="w-4 h-4 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          Debug Logs
        </button>
      </div>
      )}
    </div>
  );
};

export default App;
