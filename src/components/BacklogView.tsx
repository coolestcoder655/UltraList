import React from "react";
import { Task, Project } from "../types";
import { Calendar, Clock, Archive, Lightbulb, Package } from "lucide-react";

interface BacklogViewProps {
  tasks: Task[];
  projects: Project[];
  isDarkMode: boolean;
  onStartEdit: (task: Task) => void;
  onToggleTask: (id: string) => void;
  formatDate: (dateString: string) => string;
  getTagColor: (tag: string) => string;
  priorityColors: {
    low: string;
    medium: string;
    high: string;
  };
}

const BacklogView: React.FC<BacklogViewProps> = ({
  tasks,
  projects,
  isDarkMode,
  onStartEdit,
  onToggleTask,
  formatDate,
  getTagColor,
  priorityColors,
}) => {
  const getProject = (projectId?: number) => 
    projects.find(p => p.id === projectId);

  // Categorize backlog tasks
  const categorizeBacklogTasks = () => {
    const backlogTasks = tasks.filter(task => 
      !task.completed && (
        task.tags.some(tag => 
          tag.toLowerCase().includes('backlog') || 
          tag.toLowerCase().includes('someday') ||
          tag.toLowerCase().includes('later') ||
          tag.toLowerCase().includes('future')
        ) ||
        (!task.dueDate || task.dueDate === "") // Tasks without due dates
      )
    );

    const categories = {
      someday: backlogTasks.filter(task => 
        task.tags.some(tag => 
          tag.toLowerCase().includes('someday') ||
          tag.toLowerCase().includes('future')
        )
      ),
      backlog: backlogTasks.filter(task => 
        task.tags.some(tag => 
          tag.toLowerCase().includes('backlog') ||
          tag.toLowerCase().includes('later')
        )
      ),
      ideas: backlogTasks.filter(task => 
        task.tags.some(tag => 
          tag.toLowerCase().includes('idea') ||
          tag.toLowerCase().includes('brainstorm')
        )
      ),
      noDueDate: backlogTasks.filter(task => 
        (!task.dueDate || task.dueDate === "") &&
        !task.tags.some(tag => 
          ['someday', 'future', 'backlog', 'later', 'idea', 'brainstorm'].some(keyword =>
            tag.toLowerCase().includes(keyword)
          )
        )
      ),
    };

    return categories;
  };

  const categories = categorizeBacklogTasks();

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const project = getProject(task.projectId);
    
    return (
      <div
        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
          isDarkMode
            ? "bg-gray-800 border-gray-600 hover:bg-gray-750"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
        onClick={() => onStartEdit(task)}
      >
        {/* Task title and priority */}
        <div className="flex items-start justify-between mb-2">
          <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
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
            />
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className={`text-xs mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...`
              : task.description
            }
          </p>
        )}

        {/* Due date */}
        {task.dueDate && (
          <div className={`text-xs mb-2 flex items-center gap-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            <Calendar size={12} />
            Due: {formatDate(task.dueDate)}
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

  const CategorySection: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ElementType; 
    tasks: Task[]; 
    emptyMessage: string;
  }> = ({ title, description, icon: Icon, tasks, emptyMessage }) => (
    <div className={`rounded-xl p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
          <Icon 
            size={20} 
            className={isDarkMode ? "text-gray-300" : "text-gray-600"} 
          />
        </div>
        <div>
          <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {description}
          </p>
        </div>
        <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
          isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
        }`}>
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <Icon size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-xl p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${isDarkMode ? "bg-purple-900" : "bg-purple-100"}`}>
            <Archive size={24} className={isDarkMode ? "text-purple-400" : "text-purple-600"} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Backlog & Someday List
            </h2>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Ideas, future projects, and tasks for later
            </p>
          </div>
        </div>
        
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg ${
          isDarkMode ? "bg-gray-700" : "bg-gray-50"
        }`}>
          <div className="text-center">
            <div className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {categories.someday.length}
            </div>
            <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Someday
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {categories.backlog.length}
            </div>
            <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Backlog
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {categories.ideas.length}
            </div>
            <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Ideas
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {categories.noDueDate.length}
            </div>
            <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              No Due Date
            </div>
          </div>
        </div>
      </div>

      {/* Someday/Future Tasks */}
      <CategorySection
        title="Someday / Maybe"
        description="Tasks for the distant future or dreams"
        icon={Clock}
        tasks={categories.someday}
        emptyMessage="No someday tasks. Add tasks with #someday or #future tags."
      />

      {/* Backlog Tasks */}
      <CategorySection
        title="Backlog"
        description="Tasks planned for later sprints or phases"
        icon={Package}
        tasks={categories.backlog}
        emptyMessage="No backlog tasks. Add tasks with #backlog or #later tags."
      />

      {/* Ideas */}
      <CategorySection
        title="Ideas & Brainstorms"
        description="Creative ideas and brainstorming items"
        icon={Lightbulb}
        tasks={categories.ideas}
        emptyMessage="No ideas captured. Add tasks with #idea or #brainstorm tags."
      />

      {/* Tasks without due dates */}
      <CategorySection
        title="No Due Date"
        description="Tasks that haven't been scheduled yet"
        icon={Calendar}
        tasks={categories.noDueDate}
        emptyMessage="All tasks have due dates assigned."
      />
    </div>
  );
};

export default BacklogView;
