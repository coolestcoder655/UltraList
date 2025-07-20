import { useState } from "react";
import type { Task as TaskType, TaskUpdate, Subtask } from "../types";

export const useTasks = (initialTasks: TaskType[] = []) => {
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);

  const updateTask = (id: number, updates: TaskUpdate): void => {
    setTasks(
      tasks.map((task: TaskType) =>
        String(task.id) === String(id) ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (id: number): void => {
    setTasks(tasks.filter((task: TaskType) => String(task.id) !== String(id)));
  };

  const toggleTask = (id: number): void => {
    updateTask(id, {
      completed: !tasks.find((t: TaskType) => String(t.id) === String(id))!
        .completed,
    });
  };

  const toggleSubtask = (taskId: number, subtaskId: number): void => {
    const task: TaskType | undefined = tasks.find(
      (t: TaskType) => String(t.id) === String(taskId)
    );
    if (!task) return;
    const updatedSubtasks: Subtask[] = task.subtasks.map((st: Subtask) =>
      String(st.id) === String(subtaskId)
        ? { ...st, completed: !st.completed }
        : st
    );
    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const addTask = (newTask: Omit<TaskType, "id">): void => {
    const task: TaskType = {
      id: Date.now().toString(),
      ...newTask,
    };
    setTasks([...tasks, task]);
  };

  const isOverdue = (dateString: string): boolean => {
    if (!dateString) return false;
    try {
      const taskDate = new Date(dateString);
      const today = new Date();
      // Reset time to compare only dates
      taskDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return taskDate < today;
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return false;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "No due date";
    const date: Date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return {
    tasks,
    setTasks,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
    addTask,
    isOverdue,
    formatDate,
  };
};
