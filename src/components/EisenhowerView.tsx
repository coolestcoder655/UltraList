import React from "react";
import { Task, Project } from "../types";
import { AlertTriangle, Clock, CheckCircle, Pause } from "lucide-react";

interface EisenhowerViewProps {
  tasks: Task[];
  projects: Project[];
  isDarkMode: boolean;
  onStartEdit: (task: Task) => void;
  onToggleTask: (id: string) => void;
  formatDate: (dateString: string) => string;
  isOverdue: (dateString: string) => boolean;
  getTagColor: (tag: string) => string;
  priorityColors: {
    low: string;
    medium: string;
    high: string;
  };
}

const EisenhowerView: React.FC<EisenhowerViewProps> = ({
  tasks,
  projects,
  isDarkMode,
  onStartEdit,
  onToggleTask,
  formatDate,
  isOverdue,
  getTagColor,
  priorityColors,
}) => {
  const getProject = (projectId?: number) => 
    projects.find(p => p.id === projectId);

  // Categorize tasks into Eisenhower Matrix quadrants
  const categorizeTask = (task: Task): "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important" => {
    const hasDeadline = task.dueDate && task.dueDate.trim() !== "";
    const isUrgent = hasDeadline && (isOverdue(task.dueDate) || 
      (new Date(task.dueDate).getTime() - new Date().getTime()) < 3 * 24 * 60 * 60 * 1000); // Due within 3 days
    const isImportant = task.priority === "high" || task.priority === "medium";

    if (isUrgent && isImportant) return "urgent-important";
    if (!isUrgent && isImportant) return "not-urgent-important";
    if (isUrgent && !isImportant) return "urgent-not-important";
    return "not-urgent-not-important";
  };

  const quadrants = [
    {
      id: "urgent-important",
      title: "Do First",
      subtitle: "Urgent & Important",
      description: "Crises, emergencies, deadline-driven projects",
      icon: AlertTriangle,
      color: "bg-red-100",
      darkColor: "bg-red-900",
      borderColor: "border-red-300",
      darkBorderColor: "border-red-700",
      textColor: "text-red-800",
      darkTextColor: "text-red-200",
    },
    {
      id: "not-urgent-important",
      title: "Schedule",
      subtitle: "Not Urgent & Important",
      description: "Planning, prevention, personal development",
      icon: Clock,
      color: "bg-yellow-100",
      darkColor: "bg-yellow-900",
      borderColor: "border-yellow-300",
      darkBorderColor: "border-yellow-700",
      textColor: "text-yellow-800",
      darkTextColor: "text-yellow-200",
    },
    {
      id: "urgent-not-important",
      title: "Delegate",
      subtitle: "Urgent & Not Important",
      description: "Interruptions, some calls, some emails",
      icon: CheckCircle,
      color: "bg-blue-100",
      darkColor: "bg-blue-900",
      borderColor: "border-blue-300",
      darkBorderColor: "border-blue-700",
      textColor: "text-blue-800",
      darkTextColor: "text-blue-200",
    },
    {
      id: "not-urgent-not-important",
      title: "Eliminate",
      subtitle: "Not Urgent & Not Important",
      description: "Time wasters, some social media, busy work",
      icon: Pause,
      color: "bg-gray-100",
      darkColor: "bg-gray-800",
      borderColor: "border-gray-300",
      darkBorderColor: "border-gray-600",
      textColor: "text-gray-800",
      darkTextColor: "text-gray-200",
    },
  ];

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const project = getProject(task.projectId);
    const overdue = isOverdue(task.dueDate);
    
    return (
      <div
        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
          isDarkMode
            ? "bg-gray-800 border-gray-600 hover:bg-gray-750"
            : "bg-white border-gray-200 hover:bg-gray-50"
        } ${task.completed ? "opacity-60" : ""}`}
        onClick={() => onStartEdit(task)}
      >
        {/* Task title and completion */}
        <div className="flex items-start justify-between mb-2">
          <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"} ${
            task.completed ? "line-through" : ""
          }`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <div
              className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}
              title={`${task.priority} priority`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleTask(task.id);
              }}
              className={`w-4 h-4 rounded border-2 transition-colors ${
                task.completed
                  ? "bg-green-500 border-green-500"
                  : isDarkMode
                  ? "border-gray-500 hover:border-green-400"
                  : "border-gray-300 hover:border-green-500"
              }`}
              title={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className={`text-xs mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {task.description.length > 60 
              ? `${task.description.substring(0, 60)}...`
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
            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${project.color}`} />
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
            <div className={`w-full rounded-full h-1 ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
              <div
                className="bg-blue-500 h-1 rounded-full transition-all"
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
            {task.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className={`px-1.5 py-0.5 text-xs rounded text-white ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className={`px-1.5 py-0.5 text-xs rounded ${
                isDarkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"
              }`}>
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const QuadrantView: React.FC<{ quadrant: any; tasksInQuadrant: Task[] }> = ({ 
    quadrant, 
    tasksInQuadrant 
  }) => {
    const Icon = quadrant.icon;
    
    return (
      <div
        className={`rounded-lg border-2 p-4 ${
          isDarkMode
            ? `${quadrant.darkColor} ${quadrant.darkBorderColor}`
            : `${quadrant.color} ${quadrant.borderColor}`
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon 
            size={20} 
            className={isDarkMode ? quadrant.darkTextColor : quadrant.textColor}
          />
          <div>
            <h3 className={`font-semibold text-sm ${
              isDarkMode ? quadrant.darkTextColor : quadrant.textColor
            }`}>
              {quadrant.title}
            </h3>
            <p className={`text-xs ${
              isDarkMode ? quadrant.darkTextColor : quadrant.textColor
            } opacity-80`}>
              {quadrant.subtitle}
            </p>
          </div>
          <span
            className={`ml-auto px-2 py-1 text-xs rounded-full ${
              isDarkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tasksInQuadrant.length}
          </span>
        </div>
        
        <p className={`text-xs mb-4 ${
          isDarkMode ? quadrant.darkTextColor : quadrant.textColor
        } opacity-70`}>
          {quadrant.description}
        </p>
        
        <div className="space-y-3 min-h-[300px]">
          {tasksInQuadrant.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          
          {tasksInQuadrant.length === 0 && (
            <div
              className={`p-4 text-center border-2 border-dashed rounded-lg ${
                isDarkMode
                  ? "border-gray-600 text-gray-500"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              <p className="text-sm">No tasks in this quadrant</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Group tasks by quadrant
  const tasksByQuadrant = quadrants.reduce((acc, quadrant) => {
    acc[quadrant.id] = tasks.filter(task => categorizeTask(task) === quadrant.id);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="h-full">
      <div className={`mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        <h2 className="text-xl font-semibold mb-2">Eisenhower Matrix</h2>
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Prioritize tasks based on urgency and importance
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quadrants.map((quadrant) => (
          <QuadrantView
            key={quadrant.id}
            quadrant={quadrant}
            tasksInQuadrant={tasksByQuadrant[quadrant.id] || []}
          />
        ))}
      </div>
    </div>
  );
};

export default EisenhowerView;