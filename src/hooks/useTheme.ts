import { useEffect } from "react";
import { useDatabase } from "./useDatabase";

export const useTheme = () => {
  const { theme: isDarkMode, updateTheme } = useDatabase();

  useEffect(() => {
    if (isDarkMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = async (): Promise<void> => {
    await updateTheme(isDarkMode === "dark" ? "light" : "dark");
  };

  // Tag color generation based on tag name
  const getTagColor = (tag: string): string => {
    const colors =
      isDarkMode === "dark"
        ? [
            "bg-blue-900 text-blue-200",
            "bg-green-900 text-green-200",
            "bg-purple-900 text-purple-200",
            "bg-pink-900 text-pink-200",
            "bg-indigo-900 text-indigo-200",
            "bg-teal-900 text-teal-200",
            "bg-orange-900 text-orange-200",
            "bg-cyan-900 text-cyan-200",
          ]
        : [
            "bg-blue-100 text-blue-800",
            "bg-green-100 text-green-800",
            "bg-purple-100 text-purple-800",
            "bg-pink-100 text-pink-800",
            "bg-indigo-100 text-indigo-800",
            "bg-teal-100 text-teal-800",
            "bg-orange-100 text-orange-800",
            "bg-cyan-100 text-cyan-800",
          ];

    // Generate a consistent color based on tag string
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const priorityColors = {
    low:
      isDarkMode === "dark"
        ? "bg-green-900 text-green-200 border-green-700"
        : "bg-green-100 text-green-800 border-green-200",
    medium:
      isDarkMode === "dark"
        ? "bg-yellow-900 text-yellow-200 border-yellow-700"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
    high:
      isDarkMode === "dark"
        ? "bg-red-900 text-red-200 border-red-700"
        : "bg-red-100 text-red-800 border-red-200",
  };

  return {
    isDarkMode: isDarkMode === "dark",
    toggleDarkMode,
    getTagColor,
    priorityColors,
  };
};
