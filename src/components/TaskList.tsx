import React from "react";
import Task from "./Task";
import type {
  Task as TaskType,
  EditingTask,
  PriorityColors,
  Project,
} from "../types";

interface TaskListProps {
  tasks: TaskType[];
  editingTask: EditingTask | null;
  expandedTasks: Set<string>;
  priorityColors: PriorityColors;
  isDarkMode: boolean;
  isMobileMode: boolean;
  projects: Project[];
  onToggleTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onToggleExpanded: (id: string) => void;
  onStartEdit: (task: TaskType) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditingTaskChange: (updatedTask: EditingTask) => void;
  onDeleteTask: (id: string) => void;
  formatDate: (dateString: string) => string;
  isOverdue: (dateString: string) => boolean;
  getTagColor: (tag: string) => string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  editingTask,
  expandedTasks,
  priorityColors,
  isDarkMode,
  isMobileMode,
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
  if (tasks.length === 0) {
    return (
      <div
        className={`text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
      >
        <p className="text-lg">No tasks found</p>
        <p className="text-sm">Add a task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task: TaskType) => (
        <Task
          key={task.id}
          task={task}
          editingTask={editingTask}
          expandedTasks={expandedTasks}
          priorityColors={priorityColors}
          isDarkMode={isDarkMode}
          isMobileMode={isMobileMode}
          projects={projects}
          onToggleTask={onToggleTask}
          onToggleSubtask={onToggleSubtask}
          onToggleExpanded={onToggleExpanded}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onEditingTaskChange={onEditingTaskChange}
          onDeleteTask={onDeleteTask}
          formatDate={formatDate}
          isOverdue={isOverdue}
          getTagColor={getTagColor}
        />
      ))}
    </div>
  );
};

export default TaskList;
