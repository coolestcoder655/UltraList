import { useState } from "react";
import type { NewTask, EditingTask } from "../types";
import { NaturalLanguageParser, type ParseResult } from "../services/naturalLanguageParser";

export const useTaskForm = () => {
  const [newTask, setNewTask] = useState<NewTask>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    subtasks: [],
    projectId: undefined,
    tags: [],
  });

  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [newSubtask, setNewSubtask] = useState<string>("");
  const [newTag, setNewTag] = useState<string>("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [showParseSuggestions, setShowParseSuggestions] = useState<boolean>(false);

  const resetNewTask = (): void => {
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      subtasks: [],
      projectId: undefined,
      tags: [],
    });
    setNewSubtask("");
    setParseResult(null);
    setShowParseSuggestions(false);
  };

  const addSubtaskToNewTask = (): void => {
    if (!newSubtask.trim()) return;
    setNewTask({
      ...newTask,
      subtasks: [...newTask.subtasks, newSubtask.trim()],
    });
    setNewSubtask("");
  };

  const removeSubtaskFromNewTask = (index: number): void => {
    setNewTask({
      ...newTask,
      subtasks: newTask.subtasks.filter((_: string, i: number) => i !== index),
    });
  };

  const addTagToNewTask = (): void => {
    if (!newTag.trim()) return;
    const tag = newTag.trim().toLowerCase();
    if (newTask.tags.includes(tag)) return;
    setNewTask({
      ...newTask,
      tags: [...newTask.tags, tag],
    });
    setNewTag("");
  };

  const removeTagFromNewTask = (index: number): void => {
    setNewTask({
      ...newTask,
      tags: newTask.tags.filter((_: string, i: number) => i !== index),
    });
  };

  const applyTemplate = (template: {
    defaultTitle: string;
    defaultDescription: string;
    defaultPriority: "low" | "medium" | "high";
    defaultSubtasks: string[];
    defaultProjectId?: number;
    defaultTags: string[];
  }): void => {
    setNewTask({
      title: template.defaultTitle,
      description: template.defaultDescription,
      dueDate: "",
      priority: template.defaultPriority,
      subtasks: [...template.defaultSubtasks],
      projectId: template.defaultProjectId,
      tags: [...template.defaultTags],
    });
    setParseResult(null);
    setShowParseSuggestions(false);
  };

  const parseNaturalLanguage = (input: string): void => {
    if (!input.trim()) {
      setParseResult(null);
      setShowParseSuggestions(false);
      return;
    }

    const result = NaturalLanguageParser.parse(input);
    setParseResult(result);
    setShowParseSuggestions(result.suggestions.length > 0);
  };

  const applyParsedData = (): void => {
    if (!parseResult) return;

    const { parsed } = parseResult;
    setNewTask({
      ...newTask,
      title: parsed.cleanTitle,
      dueDate: parsed.dueDate || newTask.dueDate,
      priority: parsed.priority || newTask.priority,
      tags: parsed.tags ? [...parsed.tags] : newTask.tags,
    });
    setParseResult(null);
    setShowParseSuggestions(false);
  };

  const dismissParseSuggestions = (): void => {
    setShowParseSuggestions(false);
  };

  return {
    newTask,
    setNewTask,
    editingTask,
    setEditingTask,
    newSubtask,
    setNewSubtask,
    newTag,
    setNewTag,
    parseResult,
    showParseSuggestions,
    resetNewTask,
    addSubtaskToNewTask,
    removeSubtaskFromNewTask,
    addTagToNewTask,
    removeTagFromNewTask,
    applyTemplate,
    parseNaturalLanguage,
    applyParsedData,
    dismissParseSuggestions,
  };
};
