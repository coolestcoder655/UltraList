import React from "react";
import { Task, Project } from "../types";
import { Calendar } from "lucide-react";

interface GanttViewProps {
  tasks: Task[];
  projects: Project[];
  isDarkMode: boolean;
  onStartEdit: (task: Task) => void;
  formatDate: (dateString: string) => string;
  isOverdue: (dateString: string) => boolean;
  getTagColor: (tag: string) => string;
  priorityColors: {
    low: string;
    medium: string;
    high: string;
  };
}

const GanttView: React.FC<GanttViewProps> = ({
  tasks,
  projects,
  isDarkMode,
  onStartEdit,
  formatDate,
  isOverdue,
  priorityColors,
}) => {
  // Filter tasks that have due dates for Gantt chart
  const tasksWithDates = tasks.filter(task => task.dueDate);
  
  // Calculate date range for the chart
  const today = new Date();
  const dates = tasksWithDates.map(task => new Date(task.dueDate));
  const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : today;
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : today;
  
  // Extend range to show at least 30 days
  const startDate = new Date(Math.min(minDate.getTime(), today.getTime() - 7 * 24 * 60 * 60 * 1000));
  const endDate = new Date(Math.max(maxDate.getTime(), today.getTime() + 23 * 24 * 60 * 60 * 1000));
  
  // Generate date range for header
  const dateRange: Date[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dateRange.push(new Date(d));
  }

  const getProject = (projectId?: number) => 
    projects.find(p => p.id === projectId);

  const getTaskPosition = (task: Task) => {
    const taskDate = new Date(task.dueDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((taskDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const position = (daysFromStart / totalDays) * 100;
    
    return {
      left: `${Math.max(0, Math.min(100, position))}%`,
      width: "2px", // Single day width for now
    };
  };

  const getTodayPosition = () => {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 1000 * 24));
    const daysFromStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 1000 * 24));
    return (daysFromStart / totalDays) * 100;
  };

  const TaskRow: React.FC<{ task: Task }> = ({ task }) => {
    const project = getProject(task.projectId);
    const overdue = isOverdue(task.dueDate);
    const position = getTaskPosition(task);
    
    return (
      <div
        className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex">
          {/* Task info column */}
          <div className="w-80 p-3 border-r border-gray-200 dark:border-gray-700">
            <div
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
              onClick={() => onStartEdit(task)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}
                  title={`${task.priority} priority`}
                />
                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {task.title}
                </h4>
                {task.completed && (
                  <span className="text-xs text-green-500">✓</span>
                )}
              </div>
              
              {project && (
                <div className="flex items-center mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full mr-2 ${project.color}`} />
                  <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {project.name}
                  </span>
                </div>
              )}
              
              <div className={`text-xs ${
                overdue
                  ? "text-red-500 font-medium"
                  : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}>
                Due: {formatDate(task.dueDate)}
                {overdue && " (Overdue)"}
              </div>
              
              {task.subtasks.length > 0 && (
                <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                </div>
              )}
            </div>
          </div>
          
          {/* Timeline column */}
          <div className="flex-1 p-3 relative">
            <div className="relative h-8">
              {/* Task bar */}
              <div
                className={`absolute top-2 h-4 rounded ${
                  task.completed
                    ? "bg-green-500"
                    : overdue
                    ? "bg-red-500"
                    : "bg-blue-500"
                } opacity-80 hover:opacity-100 cursor-pointer`}
                style={position}
                title={`${task.title} - Due: ${formatDate(task.dueDate)}`}
                onClick={() => onStartEdit(task)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className={`mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        <h2 className="text-xl font-semibold mb-2">Gantt Chart</h2>
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Visualize your tasks timeline and project planning
        </p>
      </div>

      {tasksWithDates.length === 0 ? (
        <div
          className={`p-8 text-center border-2 border-dashed rounded-lg ${
            isDarkMode
              ? "border-gray-600 text-gray-500 bg-gray-800"
              : "border-gray-300 text-gray-400 bg-gray-50"
          }`}
        >
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No tasks with due dates</h3>
          <p className="text-sm">
            Add due dates to your tasks to see them in the Gantt chart
          </p>
        </div>
      ) : (
        <div className={`border rounded-lg overflow-hidden ${
          isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"
        }`}>
          {/* Header with dates */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <div className="w-80 p-3 border-r border-gray-200 dark:border-gray-700">
              <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Tasks
              </h3>
            </div>
            <div className="flex-1 p-3 relative">
              <div className="flex justify-between text-xs">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  {formatDate(startDate.toISOString())}
                </span>
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  {formatDate(endDate.toISOString())}
                </span>
              </div>
              
              {/* Today indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-70"
                style={{ left: `${getTodayPosition()}%` }}
                title="Today"
              />
            </div>
          </div>

          {/* Task rows */}
          <div className="max-h-96 overflow-y-auto">
            {tasksWithDates
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
          </div>

          {/* Legend */}
          <div className={`p-3 border-t ${isDarkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  In Progress
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Overdue
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-3 bg-red-500" />
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Today
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttView;