import React, { useEffect } from "react";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    {
      category: "Task Management",
      items: [
        { key: "Alt + T", action: "Create new task" },
        { key: "Alt + E", action: "Edit most recent task" },
        { key: "Alt + D", action: "Delete most recent task" },
        { key: "Alt + C", action: "Switch to NLP (Natural Language) mode" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { key: "Alt + L", action: "Switch to List View" },
        { key: "Alt + K", action: "Switch to Kanban View" },
        { key: "Alt + G", action: "Switch to Gantt Chart View" },
        { key: "Alt + M", action: "Switch to Eisenhower Matrix" },
        { key: "Alt + P", action: "Open Pomodoro Timer" },
        { key: "Alt + F", action: "Switch to Focus Mode" },
      ],
    },
    {
      category: "Productivity",
      items: [
        { key: "Alt + S", action: "Start selected Pomodoro session" },
        { key: "Alt + R", action: "Refresh current view" },
        { key: "Alt + H", action: "Show/hide completed tasks" },
        { key: "Alt + U", action: "Toggle theme (Dark/Light)" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div
        className={`rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden transform transition-all duration-300 scale-100 ${isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
        >
          <div className="flex items-center gap-2">
            <Keyboard
              size={20}
              className={isDarkMode ? "text-blue-400" : "text-blue-600"}
            />
            <h2
              className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-opacity-20 transition-colors ${isDarkMode
                ? "hover:bg-white text-gray-400 hover:text-white"
                : "hover:bg-black text-gray-600 hover:text-gray-900"
              }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {shortcuts.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3
                  className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                >
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isDarkMode
                          ? "bg-gray-700 hover:bg-gray-650"
                          : "bg-gray-50 hover:bg-gray-100"
                        }`}
                    >
                      <span
                        className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        {shortcut.action}
                      </span>
                      <kbd
                        className={`px-2 py-1 text-xs font-mono rounded border ${isDarkMode
                            ? "bg-gray-600 border-gray-500 text-gray-200"
                            : "bg-white border-gray-300 text-gray-700"
                          }`}
                      >
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t ${isDarkMode
              ? "border-gray-700 bg-gray-750"
              : "border-gray-200 bg-gray-50"
            }`}
        >
          <p
            className={`text-xs text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            Press{" "}
            <kbd
              className={`px-1 rounded ${isDarkMode ? "bg-gray-600" : "bg-gray-200"
                }`}
            >
              Esc
            </kbd>{" "}
            to close this dialog
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
