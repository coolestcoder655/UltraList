import { useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import AddTaskForm from "./components/AddTaskForm";
import ProjectManagement from "./components/ProjectManagement";
import TaskList from "./components/TaskList";
import {
  useTheme,
  useTasks,
  useProjectsAndFolders,
  useTemplates,
  useTaskForm,
  useTaskFiltering,
} from "./hooks";
import {
  initialTasks,
  initialProjects,
  initialFolders,
  initialTemplates,
} from "./data/initialData";
import type { Task as TaskType, Subtask } from "./types";
import "./App.css";

const App = (): JSX.Element => {
  // Custom hooks
  const { isDarkMode, toggleDarkMode, getTagColor, priorityColors } =
    useTheme();
  const {
    tasks,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
    addTask,
    isOverdue,
    formatDate,
  } = useTasks(initialTasks);
  const {
    projects,
    folders,
    getProjectById,
    getFolderById,
    addProject: addProjectToState,
    updateProject,
    deleteProject: deleteProjectFromState,
    addFolder: addFolderToState,
    updateFolder,
    deleteFolder: deleteFolderFromState,
  } = useProjectsAndFolders(initialProjects, initialFolders);
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
  const handleAddTask = (): void => {
    if (!newTask.title.trim()) return;

    const taskToAdd = {
      ...newTask,
      completed: false,
      subtasks: newTask.subtasks.map((text: string, index: number) => ({
        id: index + 1,
        text,
        completed: false,
      })),
    };

    addTask(taskToAdd);
    resetNewTask();
    setShowAddForm(false);
  };

  const startEdit = (task: TaskType): void => {
    setEditingTask({
      ...task,
      subtasks: task.subtasks.map((st: Subtask) => st.text),
    });
  };

  const saveEdit = (): void => {
    if (!editingTask?.title.trim()) return;

    const updatedTask: Partial<TaskType> = {
      ...editingTask,
      subtasks: editingTask.subtasks.map((text: string, index: number) => ({
        id: index + 1,
        text,
        completed:
          tasks.find((t: TaskType) => t.id === editingTask.id)?.subtasks[index]
            ?.completed || false,
      })),
    };

    updateTask(editingTask.id, updatedTask);
    setEditingTask(null);
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
  const addProject = (): void => {
    if (!newProject.name.trim()) return;
    addProjectToState(newProject);
    setNewProject({
      name: "",
      color: "bg-blue-500",
      description: "",
      folderId: undefined,
    });
  };

  const deleteProject = (id: number): void => {
    deleteProjectFromState(id);
    // Also remove this project from any tasks
    tasks.forEach((task) => {
      if (task.projectId === id) {
        updateTask(task.id, { projectId: undefined });
      }
    });
  };

  const addFolder = (): void => {
    if (!newFolder.name.trim()) return;
    addFolderToState(newFolder);
    setNewFolder({ name: "", color: "bg-gray-500", description: "" });
  };

  const deleteFolder = (id: number): void => {
    deleteFolderFromState(id);
  };

  // Get filtered and sorted tasks
  const sortedTasks = getFilteredAndSortedTasks(tasks, getProjectById);

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
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onAddFolder={addFolder}
              onUpdateFolder={updateFolder}
              onDeleteFolder={deleteFolder}
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
              onToggleTask={toggleTask}
              onToggleSubtask={toggleSubtask}
              onToggleExpanded={toggleExpanded}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingTask(null)}
              onEditingTaskChange={setEditingTask}
              onDeleteTask={deleteTask}
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
