import React, { useEffect } from "react";
import { useDatabase } from "../hooks/useDatabase";

// Example component demonstrating database usage
export const DatabaseExample: React.FC = () => {
  const {
    tasks,
    projects,
    folders,
    theme,
    loading,
    error,
    createTask,
    updateTheme,
    createProject,
    createFolder,
    toggleTaskCompletion,
  } = useDatabase();

  useEffect(() => {
    console.log("Tasks loaded:", tasks);
    console.log("Projects loaded:", projects);
    console.log("Folders loaded:", folders);
    console.log("Current theme:", theme);
  }, [tasks, projects, folders, theme]);

  const handleCreateSampleTask = async () => {
    try {
      await createTask({
        title: "Sample Task from Database",
        description: "This task was created using the SQLite database",
        dueDate: new Date().toISOString(),
        priority: "medium",
        projectId: projects[0]?.id,
        subtasks: ["Subtask 1", "Subtask 2"],
        tags: ["database", "sample"],
      });
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleCreateSampleProject = async () => {
    try {
      await createProject(
        "Database Project",
        "bg-purple-500",
        "Project created using database",
        folders[0]?.id
      );
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const handleCreateSampleFolder = async () => {
    try {
      await createFolder(
        "Database Folder",
        "bg-orange-500",
        "Folder created using database"
      );
    } catch (err) {
      console.error("Error creating folder:", err);
    }
  };

  const handleToggleTheme = async () => {
    try {
      await updateTheme(theme === "light" ? "dark" : "light");
    } catch (err) {
      console.error("Error updating theme:", err);
    }
  };

  const handleToggleFirstTask = async () => {
    if (tasks.length > 0) {
      try {
        await toggleTaskCompletion(tasks[0].id.toString(), !tasks[0].completed);
      } catch (err) {
        console.error("Error toggling task completion:", err);
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading database...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div
      className={`p-6 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <h2 className="text-2xl font-bold mb-4">Database Example</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Theme: {theme}</h3>
        <button
          onClick={handleToggleTheme}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Theme
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Tasks ({tasks.length})</h3>
          <button
            onClick={handleCreateSampleTask}
            className="mb-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Sample Task
          </button>
          {tasks.length > 0 && (
            <button
              onClick={handleToggleFirstTask}
              className="mb-2 ml-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Toggle First Task
            </button>
          )}
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className={`p-2 border rounded ${
                  task.completed ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-gray-600">{task.description}</div>
                <div className="text-xs">
                  Priority: {task.priority} | Tags: {task.tags.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            Projects ({projects.length})
          </h3>
          <button
            onClick={handleCreateSampleProject}
            className="mb-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Sample Project
          </button>
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="p-2 border rounded bg-gray-100">
                <div className="font-medium">{project.name}</div>
                <div className="text-sm text-gray-600">
                  {project.description}
                </div>
                <div
                  className={`w-4 h-4 rounded ${project.color} inline-block`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            Folders ({folders.length})
          </h3>
          <button
            onClick={handleCreateSampleFolder}
            className="mb-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Create Sample Folder
          </button>
          <div className="space-y-2">
            {folders.map((folder) => (
              <div key={folder.id} className="p-2 border rounded bg-gray-100">
                <div className="font-medium">{folder.name}</div>
                <div className="text-sm text-gray-600">
                  {folder.description}
                </div>
                <div
                  className={`w-4 h-4 rounded ${folder.color} inline-block`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
