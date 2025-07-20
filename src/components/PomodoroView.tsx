import React, { useState, useEffect, useRef } from "react";
import { Task, Project } from "../types";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Timer,
  Coffee,
  Target,
  Clock,
  Focus,
  Brain,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";

interface PomodoroViewProps {
  tasks: Task[];
  projects: Project[];
  isDarkMode: boolean;
  onStartEdit: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  getTagColor: (tag: string) => string;
  priorityColors: {
    low: string;
    medium: string;
    high: string;
  };
}

type PomodoroPhase = "work" | "short-break" | "long-break";

type TimerType = "pomodoro" | "deep-work" | "short-focus" | "custom";

interface TimerTypeInfo {
  id: TimerType;
  title: string;
  duration: number; // in minutes
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

const PomodoroView: React.FC<PomodoroViewProps> = ({
  tasks,
  projects,
  isDarkMode,
  onStartEdit,
  onToggleSubtask,
  getTagColor,
  priorityColors,
}) => {
  // Pomodoro state
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentPhase, setCurrentPhase] = useState<PomodoroPhase>("work");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTimerType, setSelectedTimerType] =
    useState<TimerType>("pomodoro");
  const [showTimerDropdown, setShowTimerDropdown] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Settings
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });

  const intervalRef = useRef<number | null>(null);

  const getProject = (projectId?: number) =>
    projects.find((p) => p.id === projectId);

  const incompleteTasks = tasks.filter((task) => !task.completed);

  // Toggle subtask expansion
  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Timer type definitions
  const timerTypes: TimerTypeInfo[] = [
    {
      id: "pomodoro",
      title: "Pomodoro",
      duration: 25,
      icon: Target,
      color: "text-red-500",
      bgColor: isDarkMode ? "bg-red-900" : "bg-red-100",
      description: "25 min work sessions with breaks",
    },
    {
      id: "deep-work",
      title: "Deep Work",
      duration: 90,
      icon: Brain,
      color: "text-purple-500",
      bgColor: isDarkMode ? "bg-purple-900" : "bg-purple-100",
      description: "90 min focused work session",
    },
    {
      id: "short-focus",
      title: "Short Focus",
      duration: 15,
      icon: Focus,
      color: "text-blue-500",
      bgColor: isDarkMode ? "bg-blue-900" : "bg-blue-100",
      description: "15 min quick focus session",
    },
    {
      id: "custom",
      title: "Custom Timer",
      duration: settings.workDuration,
      icon: Clock,
      color: "text-green-500",
      bgColor: isDarkMode ? "bg-green-900" : "bg-green-100",
      description: "Custom duration timer",
    },
  ];

  const getCurrentTimerType = () => {
    return (
      timerTypes.find((type) => type.id === selectedTimerType) || timerTypes[0]
    );
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handlePhaseComplete = () => {
    setIsRunning(false);

    if (selectedTimerType === "pomodoro") {
      if (currentPhase === "work") {
        const newCompletedSessions = completedSessions + 1;
        setCompletedSessions(newCompletedSessions);

        // Determine next phase
        if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
          setCurrentPhase("long-break");
          setTimeLeft(settings.longBreakDuration * 60);
        } else {
          setCurrentPhase("short-break");
          setTimeLeft(settings.shortBreakDuration * 60);
        }
      } else {
        // Break finished, back to work
        setCurrentPhase("work");
        setTimeLeft(settings.workDuration * 60);
      }

      // Browser notification (if permissions granted)
      if (Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
          body:
            currentPhase === "work"
              ? `Work session complete! Time for a ${
                  completedSessions % settings.sessionsUntilLongBreak === 0
                    ? "long"
                    : "short"
                } break.`
              : "Break time over! Ready for another work session?",
          icon: "/favicon.ico",
        });
      }
    } else {
      // For non-Pomodoro timers, just notify completion
      if (Notification.permission === "granted") {
        const currentTimer = getCurrentTimerType();
        new Notification("Timer Complete", {
          body: `${currentTimer.title} session complete!`,
          icon: "/favicon.ico",
        });
      }
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const currentTimer = getCurrentTimerType();

    if (selectedTimerType === "pomodoro") {
      setCurrentPhase("work");
      setTimeLeft(settings.workDuration * 60);
    } else {
      setTimeLeft(currentTimer.duration * 60);
    }
  };

  const handleTimerTypeChange = (timerType: TimerType) => {
    setSelectedTimerType(timerType);
    setShowTimerDropdown(false);
    setIsRunning(false);

    const timer = timerTypes.find((t) => t.id === timerType);
    if (timer) {
      if (timerType === "pomodoro") {
        setCurrentPhase("work");
        setTimeLeft(settings.workDuration * 60);
      } else {
        setTimeLeft(timer.duration * 60);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getPhaseInfo = () => {
    if (selectedTimerType === "pomodoro") {
      switch (currentPhase) {
        case "work":
          return {
            title: "Work Session",
            icon: Target,
            color: "text-red-500",
            bgColor: isDarkMode ? "bg-red-900" : "bg-red-100",
          };
        case "short-break":
          return {
            title: "Short Break",
            icon: Coffee,
            color: "text-blue-500",
            bgColor: isDarkMode ? "bg-blue-900" : "bg-blue-100",
          };
        case "long-break":
          return {
            title: "Long Break",
            icon: Coffee,
            color: "text-green-500",
            bgColor: isDarkMode ? "bg-green-900" : "bg-green-100",
          };
      }
    } else {
      const currentTimer = getCurrentTimerType();
      return {
        title: currentTimer.title,
        icon: currentTimer.icon,
        color: currentTimer.color,
        bgColor: currentTimer.bgColor,
      };
    }
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;

  const TaskCard: React.FC<{ task: Task; isSelected: boolean }> = ({
    task,
    isSelected,
  }) => {
    const project = getProject(task.projectId);

    return (
      <div
        className={`p-3 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? isDarkMode
              ? "bg-blue-900 border-blue-600"
              : "bg-blue-100 border-blue-300"
            : isDarkMode
            ? "bg-gray-800 border-gray-600 hover:bg-gray-750"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex items-start justify-between mb-2">
          <h4
            className={`font-medium text-sm ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {task.title}
          </h4>
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${
              priorityColors[task.priority]
            }`}
            title={`${task.priority} priority`}
          />
        </div>

        {task.description && (
          <p
            className={`text-xs mb-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {task.description.length > 50
              ? `${task.description.substring(0, 50)}...`
              : task.description}
          </p>
        )}

        {project && (
          <div className="flex items-center mb-2">
            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${project.color}`} />
            <span
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {project.name}
            </span>
          </div>
        )}

        {/* Subtasks progress */}
        {task.subtasks.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskExpansion(task.id);
                }}
                className={`flex items-center gap-1 text-xs ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-600 hover:text-gray-700"
                }`}
              >
                {expandedTasks.has(task.id) ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
                {task.subtasks.filter((st) => st.completed).length}/
                {task.subtasks.length} subtasks
              </button>
            </div>
            <div
              className={`w-full rounded-full h-1 ${
                isDarkMode ? "bg-gray-600" : "bg-gray-200"
              }`}
            >
              <div
                className="bg-blue-500 h-1 rounded-full transition-all"
                style={{
                  width: `${
                    task.subtasks.length > 0
                      ? (task.subtasks.filter((st) => st.completed).length /
                          task.subtasks.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Expanded subtasks */}
        {expandedTasks.has(task.id) && task.subtasks.length > 0 && (
          <div className="mt-2 space-y-1">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    console.log("=== POMODORO SUBTASK CLICK ===");
                    console.log("Task ID:", task.id);
                    console.log("Subtask ID:", subtask.id);
                    console.log("Subtask object:", subtask);
                    console.log("About to call onToggleSubtask");
                    onToggleSubtask(task.id, subtask.id);
                  }}
                  className={`w-3 h-3 rounded border flex items-center justify-center ${
                    subtask.completed
                      ? "bg-blue-500 border-blue-500 text-white"
                      : isDarkMode
                      ? "border-gray-500 hover:border-blue-400"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {subtask.completed && <Check size={8} />}
                </button>
                <span
                  className={`text-xs ${
                    subtask.completed
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

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className={`px-1.5 py-0.5 text-xs rounded text-white ${getTagColor(
                  tag
                )}`}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span
                className={`px-1.5 py-0.5 text-xs rounded ${
                  isDarkMode
                    ? "bg-gray-600 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const dropdownContainer = target.closest(".timer-dropdown-container");

      if (showTimerDropdown && !dropdownContainer) {
        setShowTimerDropdown(false);
      }
    };

    if (showTimerDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTimerDropdown]);

  return (
    <div className="h-full">
      <div className={`mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        <h2 className="text-xl font-semibold mb-2">Focus Timer</h2>
        <p
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Choose your preferred timer type and focus on your tasks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-2">
          <div
            className={`rounded-xl p-8 text-center ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            {/* Timer Type Selector */}
            <div className="relative mb-6 timer-dropdown-container">
              <button
                onClick={() => setShowTimerDropdown(!showTimerDropdown)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${phaseInfo.bgColor} hover:opacity-80`}
              >
                <PhaseIcon size={16} className={phaseInfo.color} />
                <span className={`text-sm font-medium ${phaseInfo.color}`}>
                  {phaseInfo.title}
                </span>
                <ChevronDown
                  size={14}
                  className={`${phaseInfo.color} transition-transform ${
                    showTimerDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showTimerDropdown && (
                <div
                  className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10 min-w-64 rounded-lg shadow-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {timerTypes.map((timer) => {
                    const TimerIcon = timer.icon;
                    return (
                      <button
                        key={timer.id}
                        onClick={() => handleTimerTypeChange(timer.id)}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          selectedTimerType === timer.id
                            ? isDarkMode
                              ? "bg-gray-600"
                              : "bg-gray-100"
                            : isDarkMode
                            ? "hover:bg-gray-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className={`p-1.5 rounded-full ${timer.bgColor}`}>
                          <TimerIcon size={14} className={timer.color} />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-medium text-sm ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {timer.title}
                          </div>
                          <div
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {timer.description}
                          </div>
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {timer.duration}m
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Timer display */}
            <div
              className={`text-6xl font-mono font-bold mb-8 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {formatTime(timeLeft)}
            </div>

            {/* Current task */}
            {selectedTask && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Focusing on:
                </p>
                <h3
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedTask.title}
                </h3>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={toggleTimer}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  isRunning
                    ? isDarkMode
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                    : isDarkMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
                {isRunning ? "Pause" : "Start"}
              </button>

              <button
                onClick={resetTimer}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }`}
              >
                <RotateCcw size={20} />
                Reset
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                <Settings size={20} />
                Settings
              </button>
            </div>

            {/* Session counter - only for Pomodoro */}
            {selectedTimerType === "pomodoro" && (
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <p>Completed Sessions: {completedSessions}</p>
                <p>
                  Next long break in:{" "}
                  {settings.sessionsUntilLongBreak -
                    (completedSessions % settings.sessionsUntilLongBreak)}{" "}
                  sessions
                </p>
              </div>
            )}

            {/* Settings panel */}
            {showSettings && (
              <div
                className={`mt-6 p-4 rounded-lg text-left ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <h4
                  className={`font-medium mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Timer Settings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Work Duration (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          workDuration: parseInt(e.target.value) || 25,
                        })
                      }
                      className={`w-full px-3 py-2 rounded border ${
                        isDarkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Short Break (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shortBreakDuration: parseInt(e.target.value) || 5,
                        })
                      }
                      className={`w-full px-3 py-2 rounded border ${
                        isDarkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Long Break (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          longBreakDuration: parseInt(e.target.value) || 15,
                        })
                      }
                      className={`w-full px-3 py-2 rounded border ${
                        isDarkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Sessions until long break
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={settings.sessionsUntilLongBreak}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sessionsUntilLongBreak: parseInt(e.target.value) || 4,
                        })
                      }
                      className={`w-full px-3 py-2 rounded border ${
                        isDarkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Selection */}
        <div>
          <div
            className={`rounded-xl p-6 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <h3
              className={`font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Select a Task
            </h3>

            {incompleteTasks.length === 0 ? (
              <div
                className={`text-center py-8 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <Timer size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">No incomplete tasks</p>
                <p className="text-xs">Add some tasks to get started!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {incompleteTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedTask?.id === task.id}
                  />
                ))}
              </div>
            )}

            {selectedTask && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => onStartEdit(selectedTask)}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Edit Task Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroView;
