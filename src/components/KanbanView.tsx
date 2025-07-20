import React from "react";
import { Task, Project } from "../types";

interface KanbanViewProps {
  tasks: Task[];
  projects: Project[];
  isDarkMode: boolean;
  onToggleTask: (id: string) => void;
  onStartEdit: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  formatDate: (dateString: string) => string;
  isOverdue: (dateString: string) => boolean;
  getTagColor: (tag: string) => string;
  priorityColors: {
    low: string;
    medium: string;
    high: string;
  };
}

const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  projects,
  isDarkMode,
  onStartEdit,
  formatDate,
  isOverdue,
  getTagColor,
  priorityColors,
}) => {
  // For now, categorize tasks by completion status
  // In the future, we could add a proper "status" field to tasks
  const columns = [
    {
      id: "todo",
      title: "To Do",
      tasks: tasks.filter(task => !task.completed),
      color: "bg-gray-100",
      darkColor: "bg-gray-700",
    },
    {
      id: "in-progress", 
      title: "In Progress",
      tasks: tasks.filter(task => 
        !task.completed && 
        task.subtasks.length > 0 && 
        task.subtasks.some(st => st.completed)
      ),
      color: "bg-blue-100",
      darkColor: "bg-blue-800",
    },
    {
      id: "done",
      title: "Done", 
      tasks: tasks.filter(task => task.completed),
      color: "bg-green-100",
      darkColor: "bg-green-800",
    },
  ];

  const getProject = (projectId?: number) => 
    projects.find(p => p.id === projectId);

  const handleTaskClick = (task: Task) => {
    onStartEdit(task);
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const project = getProject(task.projectId);
    const overdue = isOverdue(task.dueDate);
    
    return (
      <div
        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
          isDarkMode
            ? "bg-gray-800 border-gray-600 hover:bg-gray-750"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
        onClick={() => handleTaskClick(task)}
      >
        {/* Task title and priority */}
        <div className="flex items-start justify-between mb-2">
          <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {task.title}
          </h4>
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${priorityColors[task.priority]}`}
            title={`${task.priority} priority`}
          />
        </div>

        {/* Description */}
        {task.description && (
          <p className={`text-xs mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {task.description.length > 80 
              ? `${task.description.substring(0, 80)}...`
              : task.description
            }
          </p>
        )}

        {/* Due date */}
        {task.dueDate && (
          <div className={`text-xs mb-2 ${
            overdue
              ? "text-red-500 font-medium"
              : isDarkMode
              ? "text-gray-400"
              : "text-gray-600"
          }`}>
            Due: {formatDate(task.dueDate)}
            {overdue && " (Overdue)"}
          </div>
        )}

        {/* Project */}
        {project && (
          <div className="flex items-center mb-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${project.color}`} />
            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {project.name}
            </span>
          </div>
        )}

        {/* Subtasks progress */}
        {task.subtasks.length > 0 && (
          <div className="mb-2">
            <div className={`text-xs mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-1.5 ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{
                  width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full text-white ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                isDarkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"
              }`}>
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className={`mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        <h2 className="text-xl font-semibold mb-2">Kanban Board</h2>
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Organize your tasks in a visual board format
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`rounded-lg p-4 ${
              isDarkMode ? column.darkColor : column.color
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {column.title}
              </h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  isDarkMode
                    ? "bg-gray-600 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {column.tasks.length}
              </span>
            </div>
            
            <div className="space-y-3 min-h-[400px]">
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {column.tasks.length === 0 && (
                <div
                  className={`p-6 text-center border-2 border-dashed rounded-lg ${
                    isDarkMode
                      ? "border-gray-600 text-gray-500"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanView;