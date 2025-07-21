import { useEffect, useCallback } from "react";

interface KeyboardShortcutsConfig {
  onCreateTask: () => void;
  onEditTask: () => void;
  onDeleteTask: () => void;
  onSwitchToListView: () => void;
  onSwitchToEisenhowerView: () => void;
  onSwitchToFocusView: () => void;
  onSwitchToNLPMode: () => void;
  onRefreshView: () => void;
  onOpenTaskSidebar: () => void;
  onToggleCompletedTasks: () => void;
  onToggleTheme: () => void;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only trigger if Alt key is pressed
      if (!event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      const isInputFocused =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.contentEditable === "true";

      // Allow Alt + C to work even when input is focused (for switching to NLP mode)
      if (isInputFocused && key !== "c") {
        return;
      }

      switch (key) {
        case "t":
          event.preventDefault();
          config.onCreateTask();
          break;
        case "e":
          event.preventDefault();
          config.onEditTask();
          break;
        case "d":
          event.preventDefault();
          config.onDeleteTask();
          break;
        case "l":
          event.preventDefault();
          config.onSwitchToListView();
          break;
        case "m":
          event.preventDefault();
          config.onSwitchToEisenhowerView();
          break;
        case "f":
          event.preventDefault();
          config.onSwitchToFocusView();
          break;
        case "c":
          event.preventDefault();
          config.onSwitchToNLPMode();
          break;
        case "r":
          event.preventDefault();
          config.onRefreshView();
          break;
        case "b":
          event.preventDefault();
          config.onOpenTaskSidebar();
          break;
        case "h":
          event.preventDefault();
          config.onToggleCompletedTasks();
          break;
        case "u":
          event.preventDefault();
          config.onToggleTheme();
          break;
        default:
          break;
      }
    },
    [config]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Also handle Escape key for closing modals
  const handleEscapeKey = useCallback((callback: () => void) => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callback();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return { handleEscapeKey };
};
