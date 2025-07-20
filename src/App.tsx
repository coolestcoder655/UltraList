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
import {
  useTheme,
  useTemplates,
  useTaskForm,
  useTaskFiltering,
  useDatabase,
} from "./hooks";
import { initialTemplates } from "./data/initialData";
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

  const handleDeleteTask = async (id: string): Promise<void> => {
    try {
      await deleteTask(id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Failed to load database</p>
          <p className="text-sm">{error}</p>
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
    </div>
  );
};

export default App;
