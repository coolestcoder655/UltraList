import React from "react";
import {
  Edit2,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";
import type {
  Task,
  EditingTask,
  Priority,
  PriorityColors,
  Subtask,
  Project,
} from "../types";

interface TaskProps {
  task: Task;
  editingTask: EditingTask | null;
  expandedTasks: Set<string>;
  priorityColors: PriorityColors;
  isDarkMode: boolean;
  projects: Project[];
  onToggleTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onToggleExpanded: (id: string) => void;
  onStartEdit: (task: Task) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditingTaskChange: (updatedTask: EditingTask) => void;
  onDeleteTask: (id: string) => void;
  formatDate: (dateString: string) => string;
  isOverdue: (dateString: string) => boolean;
  getTagColor: (tag: string) => string;
}

const Task: React.FC<TaskProps> = ({
  task,
  editingTask,
  expandedTasks,
  priorityColors,
  isDarkMode,
  projects,
  onToggleTask,
  onToggleSubtask,
  onToggleExpanded,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditingTaskChange,
  onDeleteTask,
  formatDate,
  isOverdue,
  getTagColor,
}) => {
  const getProjectById = (id: number): Project | undefined => {
    return projects.find((project) => project.id === id);
  };
  return (
    <div
      className={`border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
        isDarkMode ? "bg-gray-700" : "bg-white"
      } ${
        task.completed
          ? isDarkMode
            ? "border-green-700 bg-green-900/30"
            : "border-green-200 bg-green-50"
          : isDarkMode
          ? "border-gray-600"
          : "border-gray-200"
      } ${
        isOverdue(task.dueDate) && !task.completed
          ? isDarkMode
            ? "border-red-600 bg-red-900/30"
            : "border-red-300 bg-red-50"
          : ""
      }`}
    >
      {editingTask && editingTask.id === task.id ? (
        /* Edit Form */
        <div className="space-y-4">
          <input
            type="text"
            value={editingTask.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onEditingTaskChange({
                ...editingTask,
                title: e.target.value,
              })
            }
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            }`}
          />
          <textarea
            value={editingTask.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onEditingTaskChange({
                ...editingTask,
                description: e.target.value,
              })
            }
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            }`}
            rows={2}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="date"
              value={editingTask.dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onEditingTaskChange({
                  ...editingTask,
                  dueDate: e.target.value,
                })
              }
              className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800 text-white"
                  : "border-gray-300 bg-white"
              }`}
            />
            <select
              value={editingTask.priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onEditingTaskChange({
                  ...editingTask,
                  priority: e.target.value as Priority,
                })
              }
              className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
              value={editingTask.projectId || ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onEditingTaskChange({
                  ...editingTask,
                  projectId: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags in edit form */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {editingTask.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTagColor(
                    tag
                  )}`}
                >
                  {tag}
                  <button
                    onClick={() => {
                      const newTags = editingTask.tags.filter(
                        (_, i) => i !== index
                      );
                      onEditingTaskChange({
                        ...editingTask,
                        tags: newTags,
                      });
                    }}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSaveEdit}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Task Display */
        <div>
          <div className="flex items-start gap-3">
            <button
              onClick={() => onToggleTask(task.id)}
              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                task.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : isDarkMode
                  ? "border-gray-500 hover:border-green-400"
                  : "border-gray-300 hover:border-green-400"
              }`}
            >
              {task.completed && <Check size={14} />}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className={`text-lg font-medium ${
                    task.completed
                      ? isDarkMode
                        ? "line-through text-gray-400"
                        : "line-through text-gray-500"
                      : isDarkMode
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
                {task.projectId && getProjectById(task.projectId) && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full text-white border border-transparent ${
                      getProjectById(task.projectId)?.color || "bg-gray-500"
                    }`}
                  >
                    {getProjectById(task.projectId)?.name}
                  </span>
                )}
                {isOverdue(task.dueDate) && !task.completed && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      isDarkMode
                        ? "bg-red-900 text-red-200 border-red-700"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    Overdue
                  </span>
                )}
              </div>

              {task.description && (
                <p
                  className={`mb-2 ${
                    task.completed
                      ? isDarkMode
                        ? "line-through text-gray-400"
                        : "line-through text-gray-500"
                      : isDarkMode
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  {task.description}
                </p>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-block px-2 py-1 rounded-full text-xs ${getTagColor(
                        tag
                      )}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div
                className={`flex items-center gap-4 text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span
                      className={
                        isOverdue(task.dueDate) && !task.completed
                          ? isDarkMode
                            ? "text-red-400 font-medium"
                            : "text-red-600 font-medium"
                          : ""
                      }
                    >
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}

                {task.subtasks.length > 0 && (
                  <button
                    onClick={() => onToggleExpanded(task.id)}
                    className={`flex items-center gap-1 ${
                      isDarkMode ? "hover:text-gray-300" : "hover:text-gray-700"
                    }`}
                  >
                    {expandedTasks.has(task.id) ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                    {task.subtasks.filter((st: Subtask) => st.completed).length}
                    /{task.subtasks.length} subtasks
                  </button>
                )}
              </div>

              {/* Subtasks */}
              {expandedTasks.has(task.id) && task.subtasks.length > 0 && (
                <div className="mt-3 ml-4 space-y-2">
                  {task.subtasks.map((subtask: Subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleSubtask(task.id, subtask.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          subtask.completed
                            ? "bg-blue-500 border-blue-500 text-white"
                            : isDarkMode
                            ? "border-gray-500 hover:border-blue-400"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {subtask.completed && <Check size={10} />}
                      </button>
                      <span
                        className={`text-sm ${
                          subtask.completed
                            ? isDarkMode
                              ? "line-through text-gray-400"
                              : "line-through text-gray-500"
                            : isDarkMode
                            ? "text-gray-300"
                            : "text-gray-900"
                        }`}
                      >
                        {subtask.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onStartEdit(task)}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-blue-400"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-red-400"
                    : "text-gray-500 hover:text-red-600"
                }`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;
