import { useState } from "react";
import type { TaskTemplate } from "../types";

export const useTemplates = (initialTemplates: TaskTemplate[] = []) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>(initialTemplates);

  const addTemplate = (templateData: Omit<TaskTemplate, 'id'>): void => {
    const template: TaskTemplate = {
      id: Date.now(),
      ...templateData,
    };
    setTemplates([...templates, template]);
  };

  const deleteTemplate = (id: number): void => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const getTemplateById = (id: number): TaskTemplate | undefined => {
    return templates.find((t) => t.id === id);
  };

  return {
    templates,
    setTemplates,
    addTemplate,
    deleteTemplate,
    getTemplateById,
  };
};
