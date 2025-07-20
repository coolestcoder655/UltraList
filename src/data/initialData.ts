import type { Task as TaskType, Project, Folder, TaskTemplate } from "../types";

export const initialFolders: Folder[] = [
  {
    id: 1,
    name: "Work & Career",
    color: "bg-blue-600",
    description: "Professional projects and development",
  },
  {
    id: 2,
    name: "Life & Wellness",
    color: "bg-green-600",
    description: "Personal growth and health",
  },
];

export const initialProjects: Project[] = [
  {
    id: 1,
    name: "Work",
    color: "bg-blue-500",
    description: "Work-related tasks",
    folderId: 1,
  },
  {
    id: 2,
    name: "Personal",
    color: "bg-green-500",
    description: "Personal tasks and errands",
    folderId: 2,
  },
  {
    id: 3,
    name: "Health",
    color: "bg-purple-500",
    description: "Health and fitness goals",
    folderId: 2,
  },
];

export const initialTemplates: TaskTemplate[] = [
  {
    id: 1,
    name: "Weekly Review",
    description: "Template for weekly planning and review sessions",
    defaultTitle: "Weekly Review - Week of [DATE]",
    defaultDescription: "Review accomplishments, plan for upcoming week",
    defaultPriority: "medium",
    defaultSubtasks: [
      "Review completed tasks",
      "Plan upcoming week",
      "Update goals",
    ],
    defaultProjectId: 2,
    defaultTags: ["review", "planning"],
  },
  {
    id: 2,
    name: "Project Kickoff",
    description: "Template for starting new projects",
    defaultTitle: "Project Kickoff - [PROJECT NAME]",
    defaultDescription: "Initialize new project and set up structure",
    defaultPriority: "high",
    defaultSubtasks: [
      "Define scope",
      "Set timeline",
      "Assign roles",
      "Create documentation",
    ],
    defaultProjectId: 1,
    defaultTags: ["project", "kickoff", "planning"],
  },
  {
    id: 3,
    name: "Health Checkup",
    description: "Template for health-related appointments",
    defaultTitle: "Health Checkup - [TYPE]",
    defaultDescription: "Schedule and prepare for health appointment",
    defaultPriority: "medium",
    defaultSubtasks: [
      "Schedule appointment",
      "Prepare questions",
      "Gather documents",
    ],
    defaultProjectId: 3,
    defaultTags: ["health", "appointment"],
  },
];

export const initialTasks: TaskType[] = [
  {
    id: 1,
    title: "Complete project proposal",
    description: "Write and review the Q3 project proposal document",
    dueDate: "2025-07-25",
    priority: "high",
    completed: false,
    projectId: 1,
    tags: ["urgent", "document", "deadline"],
    subtasks: [
      { id: 1, text: "Research requirements", completed: true },
      { id: 2, text: "Draft outline", completed: false },
      { id: 3, text: "Review with team", completed: false },
    ],
  },
  {
    id: 2,
    title: "Buy groceries",
    description: "Weekly grocery shopping for the family",
    dueDate: "2025-07-20",
    priority: "medium",
    completed: true,
    projectId: 2,
    tags: ["shopping", "family"],
    subtasks: [
      { id: 1, text: "Make shopping list", completed: true },
      { id: 2, text: "Visit supermarket", completed: true },
    ],
  },
  {
    id: 3,
    title: "Submit tax documents",
    description: "File quarterly tax documents with accounting team",
    dueDate: "2025-07-15",
    priority: "high",
    completed: false,
    projectId: 1,
    tags: ["urgent", "deadline", "tax"],
    subtasks: [
      { id: 1, text: "Gather receipts", completed: true },
      { id: 2, text: "Complete forms", completed: false },
      { id: 3, text: "Submit to accountant", completed: false },
    ],
  },
];
