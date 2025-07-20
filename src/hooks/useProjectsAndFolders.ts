import { useState } from "react";
import type { Project, Folder } from "../types";

export const useProjectsAndFolders = (
  initialProjects: Project[] = [],
  initialFolders: Folder[] = []
) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [folders, setFolders] = useState<Folder[]>(initialFolders);

  const getProjectById = (id: number): Project | undefined => {
    return projects.find((project) => project.id === id);
  };

  const getFolderById = (id: number): Folder | undefined => {
    return folders.find((folder) => folder.id === id);
  };

  const addProject = (projectData: Omit<Project, "id">): void => {
    const project: Project = {
      id: Date.now(),
      ...projectData,
    };
    setProjects([...projects, project]);
  };

  const updateProject = (id: number, updates: Partial<Project>): void => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: number): void => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const addFolder = (folderData: Omit<Folder, "id">): void => {
    const folder: Folder = {
      id: Date.now(),
      ...folderData,
    };
    setFolders([...folders, folder]);
  };

  const updateFolder = (id: number, updates: Partial<Folder>): void => {
    setFolders(folders.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteFolder = (id: number): void => {
    setFolders(folders.filter((f) => f.id !== id));
    // Remove folder association from projects
    setProjects(
      projects.map((p) =>
        p.folderId === id ? { ...p, folderId: undefined } : p
      )
    );
  };

  return {
    projects,
    folders,
    setProjects,
    setFolders,
    getProjectById,
    getFolderById,
    addProject,
    updateProject,
    deleteProject,
    addFolder,
    updateFolder,
    deleteFolder,
  };
};
