# SQLite Database Implementation for UltraList

## Overview

Your UltraList application now has a complete SQLite database implementation that stores:

- **Tasks** with all properties (title, description, due date, priority, completion status)
- **Subtasks** linked to parent tasks
- **Tags** associated with tasks
- **Projects** with colors and descriptions
- **Folders** to organize projects
- **Settings** including dark/light mode theme

## Database Location

The SQLite database file is stored at: `~/.ultralist/ultralist.db` (user's home directory)

## How to Use

### 1. Import the Database Hook

```typescript
import { useDatabase } from "./hooks/useDatabase";
```

### 2. Use in Your Components

```typescript
const MyComponent = () => {
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
    updateTheme,
    createProject,
    createFolder,
  } = useDatabase();

  // Your component logic here
};
```

### 3. Create a New Task

```typescript
const handleCreateTask = async () => {
  try {
    await createTask({
      title: "My New Task",
      description: "Task description",
      dueDate: "2025-07-25T09:00:00Z",
      priority: "high",
      projectId: 1,
      subtasks: ["Subtask 1", "Subtask 2"],
      tags: ["urgent", "work"],
    });
  } catch (error) {
    console.error("Failed to create task:", error);
  }
};
```

### 4. Update Task

```typescript
const handleUpdateTask = async (taskId: string) => {
  try {
    await updateTask(taskId, {
      title: "Updated Title",
      completed: true,
      priority: "low",
    });
  } catch (error) {
    console.error("Failed to update task:", error);
  }
};
```

### 5. Theme Management

```typescript
const handleToggleTheme = async () => {
  try {
    await updateTheme(theme === "light" ? "dark" : "light");
  } catch (error) {
    console.error("Failed to update theme:", error);
  }
};
```

### 6. Project and Folder Management

```typescript
// Create a new project
const handleCreateProject = async () => {
  try {
    await createProject(
      "New Project",
      "bg-blue-500",
      "Project description",
      folderId // optional folder ID
    );
  } catch (error) {
    console.error("Failed to create project:", error);
  }
};

// Create a new folder
const handleCreateFolder = async () => {
  try {
    await createFolder("New Folder", "bg-green-500", "Folder description");
  } catch (error) {
    console.error("Failed to create folder:", error);
  }
};
```

## Available Operations

### Task Operations

- `createTask(taskData)` - Create a new task
- `updateTask(taskId, updates)` - Update an existing task
- `deleteTask(taskId)` - Delete a task
- `toggleTaskCompletion(taskId, completed)` - Toggle task completion
- `toggleSubtaskCompletion(subtaskId, completed)` - Toggle subtask completion

### Project Operations

- `createProject(name, color, description, folderId)` - Create a new project
- `deleteProject(projectId)` - Delete a project

### Folder Operations

- `createFolder(name, color, description)` - Create a new folder
- `deleteFolder(folderId)` - Delete a folder

### Theme & Settings

- `updateTheme(theme)` - Switch between 'light' and 'dark' themes
- `saveSetting(key, value)` - Save a custom setting
- `getSetting(key)` - Get a custom setting

### Data Access

- `tasks` - Array of all tasks with subtasks and tags
- `projects` - Array of all projects
- `folders` - Array of all folders
- `tags` - Array of all unique tags
- `theme` - Current theme ('light' or 'dark')
- `loading` - Boolean indicating if data is loading
- `error` - Error message if any operation failed

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    completed BOOLEAN NOT NULL DEFAULT 0,
    project_id INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

### Subtasks Table

```sql
CREATE TABLE subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);
```

### Tags Table

```sql
CREATE TABLE tags (
    task_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY (task_id, tag),
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);
```

### Projects Table

```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    folder_id INTEGER,
    FOREIGN KEY (folder_id) REFERENCES folders (id)
);
```

### Folders Table

```sql
CREATE TABLE folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT
);
```

### Settings Table

```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

## Example Integration

To integrate this with your existing components, replace the current state management with the database hook:

```typescript
// Before (using local state)
const [tasks, setTasks] = useState([]);

// After (using database)
const { tasks, createTask, updateTask, deleteTask } = useDatabase();
```

The database automatically handles:

- Data persistence across app restarts
- Unique ID generation for tasks and subtasks
- Relationship management between tasks, subtasks, and tags
- Theme persistence
- Error handling and loading states

## Testing

Use the `DatabaseExample` component to test all database operations:

```typescript
import { DatabaseExample } from "./components/DatabaseExample";

// Add to your App.tsx temporarily for testing
<DatabaseExample />;
```

This component provides buttons to:

- Create sample tasks, projects, and folders
- Toggle theme
- Toggle task completion
- View all stored data

## Performance

The implementation includes:

- Database indexes for common queries
- Efficient batch operations
- Automatic cleanup of related data (CASCADE DELETE)
- Connection pooling through Rust's rusqlite library
