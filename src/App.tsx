import { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import AddTaskForm from "./components/AddTaskForm";
import ProjectManagement from "./components/ProjectManagement";
import SavedSearchList from "./components/SavedSearchList";
import TaskList from "./components/TaskList";
import type {
  Task as TaskType,
  NewTask,
  EditingTask,
  TaskUpdate,
  FilterBy,
  Priority,
  PriorityColors,
  Subtask,
  Project,
  Folder,
  TaskTemplate,
  SavedSearch,
} from "./types";
import "./App.css";

const App = (): JSX.Element => {
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: 1,
      name: "Work & Career",
      color: "bg-blue-600",
      description: "Professional projects and development",
    },
    {
      id: 2,
      name: "Life & Wellness",
      color: "bg-green-600",
      description: "Personal growth and health",
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Work",
      color: "bg-blue-500",
      description: "Work-related tasks",
      folderId: 1,
    },
    {
      id: 2,
      name: "Personal",
      color: "bg-green-500",
      description: "Personal tasks and errands",
      folderId: 2,
    },
    {
      id: 3,
      name: "Health",
      color: "bg-purple-500",
      description: "Health and fitness goals",
      folderId: 2,
    },
  ]);

  const [templates, setTemplates] = useState<TaskTemplate[]>([
    {
      id: 1,
      name: "Weekly Review",
      description: "Template for weekly planning and review sessions",
      defaultTitle: "Weekly Review - Week of [DATE]",
      defaultDescription: "Review accomplishments, plan for upcoming week",
      defaultPriority: "medium",
      defaultSubtasks: [
        "Review completed tasks",
        "Plan upcoming week",
        "Update goals",
      ],
      defaultProjectId: 2,
      defaultTags: ["review", "planning"],
    },
    {
      id: 2,
      name: "Project Kickoff",
      description: "Template for starting new projects",
      defaultTitle: "Project Kickoff - [PROJECT NAME]",
      defaultDescription: "Initialize new project and set up structure",
      defaultPriority: "high",
      defaultSubtasks: [
        "Define scope",
        "Set timeline",
        "Assign roles",
        "Create documentation",
      ],
      defaultProjectId: 1,
      defaultTags: ["project", "kickoff", "planning"],
    },
    {
      id: 3,
      name: "Health Checkup",
      description: "Template for health-related appointments",
      defaultTitle: "Health Checkup - [TYPE]",
      defaultDescription: "Schedule and prepare for health appointment",
      defaultPriority: "medium",
      defaultSubtasks: [
        "Schedule appointment",
        "Prepare questions",
        "Gather documents",
      ],
      defaultProjectId: 3,
      defaultTags: ["health", "appointment"],
    },
  ]);

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: 1,
      name: "Urgent Work Tasks",
      tags: ["urgent"],
      priority: "high",
      projectId: 1,
      completed: false,
    },
    {
      id: 2,
      name: "Health & Wellness",
      tags: ["health"],
      projectId: 3,
      completed: false,
    },
    {
      id: 3,
      name: "Overdue Items",
      tags: [],
      filterBy: "overdue",
    },
    {
      id: 4,
      name: "Today's Tasks",
      tags: [],
      filterBy: "today",
    },
  ]);

  const [tasks, setTasks] = useState<TaskType[]>([
    {
      id: 1,
      title: "Complete project proposal",
      description: "Write and review the Q3 project proposal document",
      dueDate: "2025-07-25",
      priority: "high",
      completed: false,
      projectId: 1,
      tags: ["urgent", "document", "deadline"],
      subtasks: [
        { id: 1, text: "Research requirements", completed: true },
        { id: 2, text: "Draft outline", completed: false },
        { id: 3, text: "Review with team", completed: false },
      ],
    },
    {
      id: 2,
      title: "Buy groceries",
      description: "Weekly grocery shopping for the family",
      dueDate: "2025-07-20",
      priority: "medium",
      completed: true,
      projectId: 2,
      tags: ["shopping", "family"],
      subtasks: [
        { id: 1, text: "Make shopping list", completed: true },
        { id: 2, text: "Visit supermarket", completed: true },
      ],
    },
    {
      id: 3,
      title: "Submit tax documents",
      description: "File quarterly tax documents with accounting team",
      dueDate: "2025-07-15",
      priority: "high",
      completed: false,
      projectId: 1,
      tags: ["urgent", "deadline", "tax"],
      subtasks: [
        { id: 1, text: "Gather receipts", completed: true },
        { id: 2, text: "Complete forms", completed: false },
        { id: 3, text: "Submit to accountant", completed: false },
      ],
    },
  ]);

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [activeSavedSearch, setActiveSavedSearch] =
    useState<SavedSearch | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
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
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [newTask, setNewTask] = useState<NewTask>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    subtasks: [],
    projectId: undefined,
    tags: [],
  });
  const [newSubtask, setNewSubtask] = useState<string>("");
  const [newTag, setNewTag] = useState<string>("");

  const priorityColors: PriorityColors = {
    low: isDarkMode
      ? "bg-green-900 text-green-200 border-green-700"
      : "bg-green-100 text-green-800 border-green-200",
    medium: isDarkMode
      ? "bg-yellow-900 text-yellow-200 border-yellow-700"
      : "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: isDarkMode
      ? "bg-red-900 text-red-200 border-red-700"
      : "bg-red-100 text-red-800 border-red-200",
  };

  // Tag color generation based on tag name
  const getTagColor = (tag: string): string => {
    const colors = isDarkMode
      ? [
          "bg-blue-900 text-blue-200",
          "bg-green-900 text-green-200",
          "bg-purple-900 text-purple-200",
          "bg-pink-900 text-pink-200",
          "bg-indigo-900 text-indigo-200",
          "bg-teal-900 text-teal-200",
          "bg-orange-900 text-orange-200",
          "bg-cyan-900 text-cyan-200",
        ]
      : [
          "bg-blue-100 text-blue-800",
          "bg-green-100 text-green-800",
          "bg-purple-100 text-purple-800",
          "bg-pink-100 text-pink-800",
          "bg-indigo-100 text-indigo-800",
          "bg-teal-100 text-teal-800",
          "bg-orange-100 text-orange-800",
          "bg-cyan-100 text-cyan-800",
        ];

    // Generate a consistent color based on tag string
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = (): void => {
    setIsDarkMode(!isDarkMode);
  };

  const getProjectById = (id: number): Project | undefined => {
    return projects.find((project) => project.id === id);
  };

  const getFolderById = (id: number): Folder | undefined => {
    return folders.find((folder) => folder.id === id);
  };

  const applyTemplate = (templateId: number): void => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setNewTask({
      title: template.defaultTitle,
      description: template.defaultDescription,
      dueDate: "",
      priority: template.defaultPriority,
      subtasks: [...template.defaultSubtasks],
      projectId: template.defaultProjectId,
      tags: [...template.defaultTags],
    });
  };

  const addTask = (): void => {
    if (!newTask.title.trim()) return;

    const task: TaskType = {
      id: Date.now(),
      ...newTask,
      completed: false,
      subtasks: newTask.subtasks.map((text: string, index: number) => ({
        id: index + 1,
        text,
        completed: false,
      })),
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      subtasks: [],
      projectId: undefined,
      tags: [],
    });
    setNewSubtask("");
    setShowAddForm(false);
  };

  const updateTask = (id: number, updates: TaskUpdate): void => {
    setTasks(
      tasks.map((task: TaskType) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (id: number): void => {
    setTasks(tasks.filter((task: TaskType) => task.id !== id));
  };

  const toggleTask = (id: number): void => {
    updateTask(id, {
      completed: !tasks.find((t: TaskType) => t.id === id)!.completed,
    });
  };

  const toggleSubtask = (taskId: number, subtaskId: number): void => {
    const task: TaskType | undefined = tasks.find(
      (t: TaskType) => t.id === taskId
    );
    if (!task) return;
    const updatedSubtasks: Subtask[] = task.subtasks.map((st: Subtask) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const addSubtaskToNewTask = (): void => {
    if (!newSubtask.trim()) return;
    setNewTask({
      ...newTask,
      subtasks: [...newTask.subtasks, newSubtask.trim()],
    });
    setNewSubtask("");
  };

  const removeSubtaskFromNewTask = (index: number): void => {
    setNewTask({
      ...newTask,
      subtasks: newTask.subtasks.filter((_: string, i: number) => i !== index),
    });
  };

  const addTagToNewTask = (): void => {
    if (!newTag.trim()) return;
    const tag = newTag.trim().toLowerCase();
    if (newTask.tags.includes(tag)) return;
    setNewTask({
      ...newTask,
      tags: [...newTask.tags, tag],
    });
    setNewTag("");
  };

  const removeTagFromNewTask = (index: number): void => {
    setNewTask({
      ...newTask,
      tags: newTask.tags.filter((_: string, i: number) => i !== index),
    });
  };

  const toggleExpanded = (id: number): void => {
    const newExpanded: Set<number> = new Set(expandedTasks);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTasks(newExpanded);
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

  const applySavedSearch = (search: SavedSearch): void => {
    setActiveSavedSearch(search);

    // Apply saved search filters
    if (search.projectId) {
      setSelectedProjectId(search.projectId);
    } else {
      setSelectedProjectId(null);
    }

    if (search.filterBy) {
      setFilterBy(search.filterBy);
    } else if (search.priority) {
      setFilterBy(search.priority === "high" ? "high" : "all");
    } else if (search.completed !== undefined) {
      setFilterBy(search.completed ? "completed" : "incomplete");
    } else {
      setFilterBy("all");
    }
  };

  const clearSavedSearch = (): void => {
    setActiveSavedSearch(null);
    setFilterBy("all");
    setSelectedProjectId(null);
  };

  // Project and Folder Management Functions
  const addProject = (): void => {
    if (!newProject.name.trim()) return;
    const project: Project = {
      id: Date.now(),
      name: newProject.name,
      color: newProject.color,
      description: newProject.description,
      folderId: newProject.folderId,
    };
    setProjects([...projects, project]);
    setNewProject({
      name: "",
      color: "bg-blue-500",
      description: "",
      folderId: undefined,
    });
  };

  const updateProject = (id: number, updates: Partial<Project>): void => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: number): void => {
    setProjects(projects.filter((p) => p.id !== id));
    // Also remove this project from any tasks
    setTasks(
      tasks.map((task) =>
        task.projectId === id ? { ...task, projectId: undefined } : task
      )
    );
  };

  const addFolder = (): void => {
    if (!newFolder.name.trim()) return;
    const folder: Folder = {
      id: Date.now(),
      name: newFolder.name,
      color: newFolder.color,
      description: newFolder.description,
    };
    setFolders([...folders, folder]);
    setNewFolder({ name: "", color: "bg-gray-500", description: "" });
  };

  const updateFolder = (id: number, updates: Partial<Folder>): void => {
    setFolders(folders.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteFolder = (id: number): void => {
    setFolders(folders.filter((f) => f.id !== id));
    // Remove folder association from projects
    setProjects(
      projects.map((p) =>
        p.folderId === id ? { ...p, folderId: undefined } : p
      )
    );
  };

  // Template Management Functions
  const saveAsTemplate = (): void => {
    if (!newTask.title.trim()) return;
    const template: TaskTemplate = {
      id: Date.now(),
      name: `Template: ${newTask.title}`,
      description: `Auto-generated from task`,
      defaultTitle: newTask.title,
      defaultDescription: newTask.description,
      defaultPriority: newTask.priority,
      defaultSubtasks: [...newTask.subtasks],
      defaultProjectId: newTask.projectId,
      defaultTags: [...newTask.tags],
    };
    setTemplates([...templates, template]);
  };

  const deleteTemplate = (id: number): void => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  // Saved Search Management Functions
  const saveCurrentSearch = (): void => {
    const name = prompt("Enter a name for this saved search:");
    if (!name) return;

    const search: SavedSearch = {
      id: Date.now(),
      name,
      tags: [], // Could be enhanced to include current tag filters
      priority: filterBy === "high" ? "high" : undefined,
      projectId: selectedProjectId || undefined,
      filterBy: filterBy !== "all" ? filterBy : undefined,
      completed:
        filterBy === "completed"
          ? true
          : filterBy === "incomplete"
          ? false
          : undefined,
    };
    setSavedSearches([...savedSearches, search]);
  };

  const deleteSavedSearch = (id: number): void => {
    setSavedSearches(savedSearches.filter((s) => s.id !== id));
    if (activeSavedSearch?.id === id) {
      clearSavedSearch();
    }
  };

  const isOverdue = (dateString: string): boolean => {
    if (!dateString) return false;
    try {
      const taskDate = new Date(dateString);
      const today = new Date();
      // Reset time to compare only dates
      taskDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return taskDate < today;
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return false;
    }
  };

  // Parse search query for special filters
  const parseSearchQuery = (query: string) => {
    const filters = {
      text: "",
      tags: [] as string[],
      priority: undefined as Priority | undefined,
      projectName: undefined as string | undefined,
      status: undefined as "completed" | "incomplete" | undefined,
      due: undefined as "today" | "overdue" | undefined,
    };

    // Split query into parts and process each
    const parts = query.split(/\s+/).filter((part) => part.length > 0);

    for (const part of parts) {
      if (part.startsWith("#")) {
        // Tag filter: #urgent
        const tag = part.slice(1).toLowerCase();
        if (tag) filters.tags.push(tag);
      } else if (part.startsWith("priority:")) {
        // Priority filter: priority:high
        const priority = part.slice(9).toLowerCase() as Priority;
        if (["low", "medium", "high"].includes(priority)) {
          filters.priority = priority;
        }
      } else if (part.startsWith("project:")) {
        // Project filter: project:work
        filters.projectName = part.slice(8).toLowerCase();
      } else if (part.startsWith("status:")) {
        // Status filter: status:completed
        const status = part.slice(7).toLowerCase();
        if (status === "completed" || status === "incomplete") {
          filters.status = status;
        }
      } else if (part.startsWith("due:")) {
        // Due date filter: due:today
        const due = part.slice(4).toLowerCase();
        if (due === "today" || due === "overdue") {
          filters.due = due;
        }
      } else {
        // Regular text search
        filters.text += (filters.text ? " " : "") + part;
      }
    }

    return filters;
  };

  const filteredTasks: TaskType[] = tasks.filter((task: TaskType) => {
    // Parse search query
    const searchFilters = parseSearchQuery(searchQuery);

    // Text search in title and description
    if (searchFilters.text) {
      const searchText = searchFilters.text.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchText);
      const descriptionMatch = task.description
        ?.toLowerCase()
        .includes(searchText);
      if (!titleMatch && !descriptionMatch) return false;
    }

    // Tag filters from search
    if (searchFilters.tags.length > 0) {
      const hasMatchingTag = searchFilters.tags.some((searchTag) =>
        task.tags.some((taskTag) => taskTag.toLowerCase().includes(searchTag))
      );
      if (!hasMatchingTag) return false;
    }

    // Priority filter from search
    if (searchFilters.priority && task.priority !== searchFilters.priority) {
      return false;
    }

    // Project name filter from search
    if (searchFilters.projectName) {
      const taskProject = getProjectById(task.projectId || 0);
      const projectMatch = taskProject?.name
        .toLowerCase()
        .includes(searchFilters.projectName);
      if (!projectMatch) return false;
    }

    // Status filter from search
    if (searchFilters.status === "completed" && !task.completed) return false;
    if (searchFilters.status === "incomplete" && task.completed) return false;

    // Due date filter from search
    if (searchFilters.due === "today") {
      const today = new Date().toISOString().split("T")[0];
      if (task.dueDate !== today) return false;
    }
    if (searchFilters.due === "overdue") {
      if (!isOverdue(task.dueDate) || task.completed) return false;
    }

    // First filter by selected project (if no search project filter)
    if (
      !searchFilters.projectName &&
      selectedProjectId !== null &&
      task.projectId !== selectedProjectId
    ) {
      return false;
    }

    // Apply saved search tag filtering
    if (activeSavedSearch && activeSavedSearch.tags.length > 0) {
      const hasMatchingTag = activeSavedSearch.tags.some((searchTag) =>
        task.tags.includes(searchTag)
      );
      if (!hasMatchingTag) return false;
    }

    // Apply saved search priority filtering
    if (
      activeSavedSearch &&
      activeSavedSearch.priority &&
      task.priority !== activeSavedSearch.priority
    ) {
      return false;
    }

    // Apply saved search completion filtering
    if (
      activeSavedSearch &&
      activeSavedSearch.completed !== undefined &&
      task.completed !== activeSavedSearch.completed
    ) {
      return false;
    }

    // Then apply other filters (only if no search query)
    if (!searchQuery.trim()) {
      if (filterBy === "completed") return task.completed;
      if (filterBy === "incomplete") return !task.completed;
      if (filterBy === "high") return task.priority === "high";
      if (filterBy === "today") {
        const today = new Date().toISOString().split("T")[0];
        return task.dueDate === today;
      }
      if (filterBy === "overdue") {
        return isOverdue(task.dueDate) && !task.completed;
      }
      if (filterBy === "urgent") {
        return (
          (task.priority === "high" || isOverdue(task.dueDate)) &&
          !task.completed
        );
      }
    }
    return true;
  });

  const sortedTasks: TaskType[] = [...filteredTasks].sort(
    (a: TaskType, b: TaskType) => {
      // Default sort by due date
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  );

  const formatDate = (dateString: string): string => {
    if (!dateString) return "No due date";
    const date: Date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
                savedSearches={savedSearches}
                activeSavedSearch={activeSavedSearch}
                onApplySavedSearch={applySavedSearch}
                onClearSavedSearch={clearSavedSearch}
                onSaveCurrentSearch={saveCurrentSearch}
                parseSearchQuery={parseSearchQuery}
                isDarkMode={isDarkMode}
                tasks={tasks}
                projects={projects}
              />
            </div>

            {/* Saved Search Management */}
            <SavedSearchList
              savedSearches={savedSearches}
              projects={projects}
              onApplySavedSearch={(filterBy, projectId) => {
                setFilterBy(filterBy);
                setSelectedProjectId(projectId);
              }}
              onDeleteSavedSearch={deleteSavedSearch}
              isDarkMode={isDarkMode}
            />

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
              onAddTask={addTask}
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
