import { useState, useEffect } from "react";
import {
  getSearchBarMode,
  setSearchBarMode,
  parseNaturalLanguageTask,
} from "../services/databaseService";
import type { SearchBarMode } from "../types";
import type { ParsedTask } from "../services/databaseService";

export const useSearchBarMode = () => {
  const [mode, setMode] = useState<SearchBarMode>("search");
  const [loading, setLoading] = useState(true);

  // Load initial mode from database
  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await getSearchBarMode();
        setMode(savedMode);
      } catch (error) {
        console.error("Failed to load search bar mode:", error);
        setMode("search"); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    loadMode();

    // Listen for external mode changes
    const handleModeChange = async () => {
      try {
        const newMode = await getSearchBarMode();
        setMode(newMode);
      } catch (error) {
        console.error("Failed to reload search bar mode:", error);
      }
    };

    // Listen for custom event when mode changes externally
    window.addEventListener("searchBarModeChanged", handleModeChange);

    return () => {
      window.removeEventListener("searchBarModeChanged", handleModeChange);
    };
  }, []);

  // Toggle between modes
  const toggleMode = async () => {
    const newMode: SearchBarMode = mode === "search" ? "create" : "search";
    try {
      await setSearchBarMode(newMode);
      setMode(newMode);
    } catch (error) {
      console.error("Failed to set search bar mode:", error);
    }
  };

  // Switch to specific mode
  const switchToMode = async (newMode: SearchBarMode) => {
    try {
      await setSearchBarMode(newMode);
      setMode(newMode);
    } catch (error) {
      console.error("Failed to set search bar mode:", error);
    }
  };

  // Parse natural language input
  const parseInput = async (input: string): Promise<ParsedTask> => {
    return await parseNaturalLanguageTask(input);
  };

  return {
    mode,
    loading,
    toggleMode,
    switchToMode,
    parseInput,
    isSearchMode: mode === "search",
    isCreateMode: mode === "create",
  };
};
