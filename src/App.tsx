import { useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import AddTaskForm from "./components/AddTaskForm";
import ProjectManagement from "./components/ProjectManagement";
import TaskList from "./components/TaskList";
import {
  useTheme,
  useTemplates,
  useTaskForm,
  useTaskFiltering,
  useDatabase,
} from "./hooks";
import { initialTemplates } from "./data/initialData";
import type { Task as TaskType, Subtask } from "./types";
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
    resetNewTask,
    addSubtaskToNewTask,
    removeSubtaskFromNewTask,
    addTagToNewTask,
    removeTagFromNewTask,
    applyTemplate: applyTemplateToForm,
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
    setEditingTask({
      ...task,
      subtasks: task.subtasks.map((st: Subtask) => st.text),
    });
  };

  const saveEdit = async (): Promise<void> => {
    if (!editingTask?.title.trim()) return;

    try {
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
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const subtask = task.subtasks.find((st) => st.id === subtaskId);
      if (subtask) {
        try {
          await toggleSubtaskCompletion(subtask.id, !subtask.completed);
        } catch (error) {
          console.error("Failed to toggle subtask:", error);
        }
      }
    }
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
      className={`min-h-screen p-4 transition-colors ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <Header
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onShowAddForm={() => setShowAddForm(!showAddForm)}
            onShowProjectForm={() => setShowProjectForm(!showProjectForm)}
          />

          <div className={`p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                parseSearchQuery={parseSearchQuery}
                isDarkMode={isDarkMode}
                tasks={tasks}
                projects={projects}
              />
            </div>

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
              onApplyTemplate={applyTemplate}
              onAddTask={handleAddTask}
              onSaveAsTemplate={saveAsTemplate}
              onAddSubtaskToNewTask={addSubtaskToNewTask}
              onRemoveSubtaskFromNewTask={removeSubtaskFromNewTask}
              onAddTagToNewTask={addTagToNewTask}
              onRemoveTagFromNewTask={removeTagFromNewTask}
              onDeleteTemplate={deleteTemplate}
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

            {/* Task List */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
