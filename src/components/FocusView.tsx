import React, { useState, useEffect } from "react";
import { Task, Project } from "../types";
import {
    Eye,
    EyeOff,
    Play,
    Pause,
    SkipForward,
    Target,
    Calendar,
    Flag,
    ChevronDown,
    ChevronRight,
    Check,
    Edit2,
} from "lucide-react";

interface FocusViewProps {
    tasks: Task[];
    projects: Project[];
    isDarkMode: boolean;
    onStartEdit: (task: Task) => void;
    onToggleTask: (id: string) => void;
    onToggleSubtask: (taskId: string, subtaskId: string) => void;
    formatDate: (dateString: string) => string;
    isOverdue: (dateString: string) => boolean;
    getTagColor: (tag: string) => string;
    priorityColors: {
        low: string;
        medium: string;
        high: string;
    };
}

const FocusView: React.FC<FocusViewProps> = ({
    tasks,
    projects,
    isDarkMode,
    onStartEdit,
    onToggleTask,
    onToggleSubtask,
    formatDate,
    isOverdue,
    getTagColor,
    priorityColors,
}) => {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0); // in seconds
    const [showAllElements, setShowAllElements] = useState(false);
    const [expandedSubtasks, setExpandedSubtasks] = useState(false);

    // Filter to only incomplete tasks
    const incompleteTasks = tasks.filter(task => !task.completed);
    const currentTask = incompleteTasks[currentTaskIndex];

    // Timer effect
    useEffect(() => {
        let interval: number | null = null;

        if (isTimerActive && currentTask) {
            interval = window.setInterval(() => {
                setTimeSpent(prevTime => prevTime + 1);
            }, 1000);
        } else if (!isTimerActive) {
            if (interval) window.clearInterval(interval);
        }

        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isTimerActive, currentTask]);

    // Reset timer when switching tasks
    useEffect(() => {
        setTimeSpent(0);
        setIsTimerActive(false);
    }, [currentTaskIndex]);

    const getProject = (projectId?: number) =>
        projects.find(p => p.id === projectId);

    const formatTimer = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const nextTask = () => {
        if (currentTaskIndex < incompleteTasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
        } else {
            setCurrentTaskIndex(0); // Loop back to first task
        }
    };

    const previousTask = () => {
        if (currentTaskIndex > 0) {
            setCurrentTaskIndex(currentTaskIndex - 1);
        } else {
            setCurrentTaskIndex(incompleteTasks.length - 1); // Loop to last task
        }
    };

    const toggleTimer = () => {
        setIsTimerActive(!isTimerActive);
    };

    const handleCompleteTask = () => {
        if (currentTask) {
            onToggleTask(currentTask.id);
            // Move to next task after a brief delay
            setTimeout(() => {
                if (currentTaskIndex >= incompleteTasks.length - 1) {
                    setCurrentTaskIndex(0);
                }
                // If this was the last task, currentTaskIndex will auto-adjust
            }, 500);
        }
    };

    const toggleSubtaskExpansion = () => {
        setExpandedSubtasks(!expandedSubtasks);
    };

    // If no incomplete tasks
    if (incompleteTasks.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <Target
                        size={64}
                        className={`mx-auto mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    />
                    <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                        All Tasks Complete!
                    </h2>
                    <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        🎉 Great job! You've completed all your tasks. Take a well-deserved break or add new tasks to continue your productivity journey.
                    </p>
                </div>
            </div>
        );
    }

    const project = getProject(currentTask?.projectId);
    const overdue = currentTask?.dueDate ? isOverdue(currentTask.dueDate) : false;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className={`mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <Target size={24} />
                            Focus Mode
                        </h2>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Concentrate on one task at a time
                        </p>
                    </div>

                    {/* Focus Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAllElements(!showAllElements)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showAllElements
                                ? isDarkMode
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-500 text-white"
                                : isDarkMode
                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            title={showAllElements ? "Hide details" : "Show details"}
                        >
                            {showAllElements ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showAllElements ? "Minimal" : "Details"}
                        </button>

                        <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {currentTaskIndex + 1} of {incompleteTasks.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Focus Area */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-2xl mx-auto">
                    {/* Timer Display */}
                    <div className="text-center mb-8">
                        <div className={`text-6xl font-mono font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                            }`}>
                            {formatTimer(timeSpent)}
                        </div>

                        {/* Timer Controls */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={toggleTimer}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${isTimerActive
                                    ? isDarkMode
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-red-500 hover:bg-red-600 text-white"
                                    : isDarkMode
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-green-500 hover:bg-green-600 text-white"
                                    }`}
                            >
                                {isTimerActive ? <Pause size={20} /> : <Play size={20} />}
                                {isTimerActive ? "Pause" : "Start"}
                            </button>

                            <button
                                onClick={() => setTimeSpent(0)}
                                className={`px-4 py-3 rounded-lg transition-colors ${isDarkMode
                                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                                    : "bg-gray-500 hover:bg-gray-600 text-white"
                                    }`}
                                title="Reset timer"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Current Task Card */}
                    <div className={`rounded-xl p-8 shadow-lg border-2 ${isDarkMode
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-gray-200"
                        }`}>

                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h1 className={`text-3xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"
                                    }`}>
                                    {currentTask?.title}
                                </h1>

                                {showAllElements && currentTask?.description && (
                                    <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                        }`}>
                                        {currentTask.description}
                                    </p>
                                )}
                            </div>

                            {/* Priority Indicator */}
                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                <div
                                    className={`w-4 h-4 rounded-full ${priorityColors[currentTask?.priority || 'medium']
                                        }`}
                                    title={`${currentTask?.priority} priority`}
                                />
                                <button
                                    onClick={() => currentTask && onStartEdit(currentTask)}
                                    className={`p-2 rounded-lg transition-colors ${isDarkMode
                                        ? "text-gray-400 hover:text-blue-400 hover:bg-gray-700"
                                        : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                                        }`}
                                    title="Edit task"
                                >
                                    <Edit2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Task Metadata */}
                        {showAllElements && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Due Date */}
                                {currentTask?.dueDate && (
                                    <div className={`flex items-center gap-2 ${overdue
                                        ? "text-red-500"
                                        : isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}>
                                        <Calendar size={16} />
                                        <span className="text-sm">
                                            Due: {formatDate(currentTask.dueDate)}
                                            {overdue && " (Overdue)"}
                                        </span>
                                    </div>
                                )}

                                {/* Project */}
                                {project && (
                                    <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"
                                        }`}>
                                        <div className={`w-3 h-3 rounded-full ${project.color}`} />
                                        <span className="text-sm">{project.name}</span>
                                    </div>
                                )}

                                {/* Priority */}
                                <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"
                                    }`}>
                                    <Flag size={16} />
                                    <span className="text-sm capitalize">
                                        {currentTask?.priority} Priority
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Subtasks */}
                        {currentTask?.subtasks && currentTask.subtasks.length > 0 && (
                            <div className="mb-6">
                                <button
                                    onClick={toggleSubtaskExpansion}
                                    className={`flex items-center gap-2 mb-3 text-sm font-medium ${isDarkMode
                                        ? "text-gray-300 hover:text-white"
                                        : "text-gray-700 hover:text-gray-900"
                                        }`}
                                >
                                    {expandedSubtasks ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                    Subtasks ({currentTask.subtasks.filter(st => st.completed).length}/{currentTask.subtasks.length})
                                </button>

                                {(expandedSubtasks || !showAllElements) && (
                                    <div className="space-y-3">
                                        {currentTask.subtasks.map((subtask) => (
                                            <div
                                                key={subtask.id}
                                                className="flex items-center gap-3"
                                            >
                                                <button
                                                    onClick={() => onToggleSubtask(currentTask.id, subtask.id)}
                                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${subtask.completed
                                                        ? "bg-blue-500 border-blue-500 text-white"
                                                        : isDarkMode
                                                            ? "border-gray-500 hover:border-blue-400"
                                                            : "border-gray-300 hover:border-blue-400"
                                                        }`}
                                                >
                                                    {subtask.completed && <Check size={12} />}
                                                </button>
                                                <span
                                                    className={`${subtask.completed
                                                        ? isDarkMode
                                                            ? "line-through text-gray-500"
                                                            : "line-through text-gray-400"
                                                        : isDarkMode
                                                            ? "text-gray-300"
                                                            : "text-gray-700"
                                                        }`}
                                                >
                                                    {subtask.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tags */}
                        {showAllElements && currentTask?.tags && currentTask.tags.length > 0 && (
                            <div className="mb-6">
                                <div className="flex flex-wrap gap-2">
                                    {currentTask.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className={`px-3 py-1 text-sm rounded-full text-white ${getTagColor(tag)}`}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                            <button
                                onClick={handleCompleteTask}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${isDarkMode
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                                    }`}
                            >
                                <Check size={20} />
                                Complete Task
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={previousTask}
                                    className={`px-4 py-3 rounded-lg transition-colors ${isDarkMode
                                        ? "bg-gray-600 hover:bg-gray-500 text-white"
                                        : "bg-gray-500 hover:bg-gray-600 text-white"
                                        }`}
                                    title="Previous task"
                                >
                                    ←
                                </button>

                                <button
                                    onClick={nextTask}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${isDarkMode
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                    title="Next task"
                                >
                                    <SkipForward size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusView;
