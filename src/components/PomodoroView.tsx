import React, { useState, useEffect, useRef } from "react";
import { Task, Project } from "../types";
import { Play, Pause, RotateCcw, Settings, Timer, Coffee, Target } from "lucide-react";

interface PomodoroViewProps {
  tasks: Task[];
  projects: Project[];
  isDarkMode: boolean;
  onStartEdit: (task: Task) => void;
  getTagColor: (tag: string) => string;
  priorityColors: {
    low: string;
    medium: string;
    high: string;
  };
}

type PomodoroPhase = "work" | "short-break" | "long-break";

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

  // Settings
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });

  const intervalRef = useRef<number | null>(null);

  const getProject = (projectId?: number) => 
    projects.find(p => p.id === projectId);

  const incompleteTasks = tasks.filter(task => !task.completed);

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
        body: currentPhase === "work" 
          ? `Work session complete! Time for a ${completedSessions % settings.sessionsUntilLongBreak === 0 ? 'long' : 'short'} break.`
          : "Break time over! Ready for another work session?",
        icon: "/favicon.ico"
      });
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentPhase("work");
    setTimeLeft(settings.workDuration * 60);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPhaseInfo = () => {
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
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;

  const TaskCard: React.FC<{ task: Task; isSelected: boolean }> = ({ task, isSelected }) => {
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
          <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {task.title}
          </h4>
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${priorityColors[task.priority]}`}
            title={`${task.priority} priority`}
          />
        </div>

        {task.description && (
          <p className={`text-xs mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {task.description.length > 50 
              ? `${task.description.substring(0, 50)}...`
              : task.description
            }
          </p>
        )}

        {project && (
          <div className="flex items-center mb-2">
            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${project.color}`} />
            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {project.name}
            </span>
          </div>
        )}

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

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="h-full">
      <div className={`mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        <h2 className="text-xl font-semibold mb-2">Pomodoro Timer</h2>
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Focus on tasks using the Pomodoro technique
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-2">
          <div className={`rounded-xl p-8 text-center ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}>
            {/* Phase indicator */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${phaseInfo.bgColor}`}>
              <PhaseIcon size={16} className={phaseInfo.color} />
              <span className={`text-sm font-medium ${phaseInfo.color}`}>
                {phaseInfo.title}
              </span>
            </div>

            {/* Timer display */}
            <div className={`text-6xl font-mono font-bold mb-8 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {formatTime(timeLeft)}
            </div>

            {/* Current task */}
            {selectedTask && (
              <div className={`mb-6 p-4 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Focusing on:
                </p>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
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

            {/* Session counter */}
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              <p>Completed Sessions: {completedSessions}</p>
              <p>
                Next long break in: {settings.sessionsUntilLongBreak - (completedSessions % settings.sessionsUntilLongBreak)} sessions
              </p>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div className={`mt-6 p-4 rounded-lg text-left ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}>
                <h4 className={`font-medium mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Timer Settings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Work Duration (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value) || 25})}
                      className={`w-full px-3 py-2 rounded border ${
                        isDarkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Short Break (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) => setSettings({...settings, shortBreakDuration: parseInt(e.target.value) || 5})}
                      className={`w-full px-3 py-2 rounded border ${
                        isDarkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Long Break (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) => setSettings({...settings, longBreakDuration: parseInt(e.target.value) || 15})}
                      className={`w-full px-3 py-2 rounded border ${
                        isDarkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Sessions until long break
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={settings.sessionsUntilLongBreak}
                      onChange={(e) => setSettings({...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4})}
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
          <div className={`rounded-xl p-6 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Select a Task
            </h3>
            
            {incompleteTasks.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
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