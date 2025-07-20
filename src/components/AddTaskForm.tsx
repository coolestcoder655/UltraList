import React from "react";
import { Plus, X } from "lucide-react";
import type {
  TaskTemplate,
  NewTask,
  Priority,
  Project,
  Folder,
} from "../types";

interface AddTaskFormProps {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  newTask: NewTask;
  setNewTask: (task: NewTask) => void;
  newSubtask: string;
  setNewSubtask: (subtask: string) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  templates: TaskTemplate[];
  projects: Project[];
  folders: Folder[];
  onApplyTemplate: (templateId: number) => void;
  onAddTask: () => void;
  onSaveAsTemplate: () => void;
  onAddSubtaskToNewTask: () => void;
  onRemoveSubtaskFromNewTask: (index: number) => void;
  onAddTagToNewTask: () => void;
  onRemoveTagFromNewTask: (index: number) => void;
  onDeleteTemplate: (id: number) => void;
  getTagColor: (tag: string) => string;
  isDarkMode: boolean;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({
  showAddForm,
  setShowAddForm,
  newTask,
  setNewTask,
  newSubtask,
  setNewSubtask,
  newTag,
  setNewTag,
  templates,
  projects,
  folders,
  onApplyTemplate,
  onAddTask,
  onSaveAsTemplate,
  onAddSubtaskToNewTask,
  onRemoveSubtaskFromNewTask,
  onAddTagToNewTask,
  onRemoveTagFromNewTask,
  onDeleteTemplate,
  getTagColor,
  isDarkMode,
}) => {
  if (!showAddForm) return null;

  const resetForm = () => {
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
  };

  return (
    <div
      className={`p-6 rounded-xl mb-6 border-2 border-dashed ${
        isDarkMode
          ? "bg-gray-700 border-gray-600"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Add New Task
      </h3>

      {/* Template Selector */}
      <div className="mb-4">
        <label
          className={`block text-sm font-medium mb-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Quick Start with Template
        </label>
        <select
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            if (e.target.value) {
              onApplyTemplate(Number(e.target.value));
              e.target.value = ""; // Reset selector
            }
          }}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode
              ? "border-gray-600 bg-gray-800 text-white"
              : "border-gray-300 bg-white"
          }`}
        >
          <option value="">Choose a template...</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} - {template.description}
            </option>
          ))}
        </select>

        {/* Template Management */}
        {templates.length > 3 && ( // Only show if there are custom templates
          <div className="mt-2">
            <h5
              className={`text-xs font-medium mb-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Manage Templates
            </h5>
            <div className="flex flex-wrap gap-1">
              {templates.slice(3).map(
                (
                  template // Skip the first 3 default templates
                ) => (
                  <span
                    key={template.id}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {template.name}
                    <button
                      onClick={() => onDeleteTemplate(template.id)}
                      className="hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Task title..."
          value={newTask.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewTask({ ...newTask, title: e.target.value })
          }
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode
              ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
              : "border-gray-300 bg-white"
          }`}
        />
        <textarea
          placeholder="Description (optional)..."
          value={newTask.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode
              ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
              : "border-gray-300 bg-white"
          }`}
          rows={3}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewTask({ ...newTask, dueDate: e.target.value })
            }
            className={`p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            }`}
          />
          <select
            value={newTask.priority}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setNewTask({
                ...newTask,
                priority: e.target.value as Priority,
              })
            }
            className={`p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            }`}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <select
            value={newTask.projectId || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setNewTask({
                ...newTask,
                projectId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className={`p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            }`}
          >
            <option value="">No Project</option>
            {folders.map((folder) => (
              <optgroup key={`folder-${folder.id}`} label={folder.name}>
                {projects
                  .filter((project) => project.folderId === folder.id)
                  .map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
              </optgroup>
            ))}
            {/* Projects without folders */}
            {projects
              .filter((project) => !project.folderId)
              .map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add tag..."
              value={newTag}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewTag(e.target.value)
              }
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && onAddTagToNewTask()
              }
              className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white"
              }`}
            />
            <button
              onClick={onAddTagToNewTask}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }`}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {newTask.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTagColor(
                  tag
                )}`}
              >
                {tag}
                <button
                  onClick={() => onRemoveTagFromNewTask(index)}
                  className="hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Subtasks
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add subtask..."
              value={newSubtask}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewSubtask(e.target.value)
              }
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && onAddSubtaskToNewTask()
              }
              className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white"
              }`}
            />
            <button
              onClick={onAddSubtaskToNewTask}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }`}
            >
              <Plus size={16} />
            </button>
          </div>
          {newTask.subtasks.length > 0 && (
            <div className="space-y-1">
              {newTask.subtasks.map((subtask: string, index: number) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    {subtask}
                  </span>
                  <button
                    onClick={() => onRemoveSubtaskFromNewTask(index)}
                    className={`ml-auto text-red-500 hover:text-red-700`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onAddTask}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add Task
          </button>
          <button
            onClick={onSaveAsTemplate}
            disabled={!newTask.title.trim()}
            className={`px-6 py-2 rounded-lg transition-colors ${
              !newTask.title.trim()
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : isDarkMode
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
          >
            Save as Template
          </button>
          <button
            onClick={() => {
              setShowAddForm(false);
              resetForm();
            }}
            className={`px-6 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskForm;
