import React from "react";
import { Plus, X, Edit2, Check } from "lucide-react";
import type { Project, Folder } from "../types";

interface ProjectManagementProps {
  showProjectForm: boolean;
  setShowProjectForm: (show: boolean) => void;
  newProject: {
    name: string;
    color: string;
    description: string;
    folderId: number | undefined;
  };
  setNewProject: (project: any) => void;
  newFolder: {
    name: string;
    color: string;
    description: string;
  };
  setNewFolder: (folder: any) => void;
  projects: Project[];
  folders: Folder[];
  editingProject: Project | null;
  setEditingProject: (project: Project | null) => void;
  editingFolder: Folder | null;
  setEditingFolder: (folder: Folder | null) => void;
  onAddProject: () => void;
  onUpdateProject: (id: number, updates: Partial<Project>) => void;
  onDeleteProject: (id: number) => void;
  onAddFolder: () => void;
  onUpdateFolder: (id: number, updates: Partial<Folder>) => void;
  onDeleteFolder: (id: number) => void;
  getFolderById: (id: number) => Folder | undefined;
  isDarkMode: boolean;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  showProjectForm,
  setShowProjectForm,
  newProject,
  setNewProject,
  newFolder,
  setNewFolder,
  projects,
  folders,
  editingProject,
  setEditingProject,
  editingFolder,
  setEditingFolder,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder,
  getFolderById,
  isDarkMode,
}) => {
  if (!showProjectForm) return null;

  return (
    <div
      className={`p-6 rounded-xl mb-6 border-2 border-dashed ${
        isDarkMode
          ? "bg-gray-700 border-gray-600"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Manage Projects & Folders
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Folder */}
        <div className="space-y-4">
          <h4
            className={`font-medium ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Add New Folder
          </h4>
          <input
            type="text"
            placeholder="Folder name..."
            value={newFolder.name}
            onChange={(e) =>
              setNewFolder({ ...newFolder, name: e.target.value })
            }
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            }`}
          />
          <div className="flex gap-2">
            <select
              value={newFolder.color}
              onChange={(e) =>
                setNewFolder({ ...newFolder, color: e.target.value })
              }
              className={`p-3 border rounded-lg flex-1 ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              <option value="bg-blue-600">Blue</option>
              <option value="bg-green-600">Green</option>
              <option value="bg-purple-600">Purple</option>
              <option value="bg-red-600">Red</option>
              <option value="bg-yellow-600">Yellow</option>
              <option value="bg-indigo-600">Indigo</option>
            </select>
            <button
              onClick={onAddFolder}
              disabled={!newFolder.name.trim()}
              className={`px-4 py-3 rounded-lg transition-colors ${
                !newFolder.name.trim()
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : isDarkMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Add New Project */}
        <div className="space-y-4">
          <h4
            className={`font-medium ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Add New Project
          </h4>
          <input
            type="text"
            placeholder="Project name..."
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            }`}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newProject.color}
              onChange={(e) =>
                setNewProject({ ...newProject, color: e.target.value })
              }
              className={`p-3 border rounded-lg ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              <option value="bg-blue-500">Blue</option>
              <option value="bg-green-500">Green</option>
              <option value="bg-purple-500">Purple</option>
              <option value="bg-red-500">Red</option>
              <option value="bg-yellow-500">Yellow</option>
              <option value="bg-indigo-500">Indigo</option>
            </select>
            <select
              value={newProject.folderId || ""}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  folderId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className={`p-3 border rounded-lg ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              <option value="">No Folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onAddProject}
            disabled={!newProject.name.trim()}
            className={`w-full px-4 py-3 rounded-lg transition-colors ${
              !newProject.name.trim()
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : isDarkMode
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            Add Project
          </button>
        </div>
      </div>

      {/* Existing Folders and Projects */}
      <div className="mt-6 space-y-4">
        <h4
          className={`font-medium ${
            isDarkMode ? "text-gray-200" : "text-gray-800"
          }`}
        >
          Existing Items
        </h4>

        {/* Folders */}
        <div>
          <h5
            className={`text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Folders
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              >
                {editingFolder?.id === folder.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={editingFolder.color}
                      onChange={(e) =>
                        setEditingFolder({
                          ...editingFolder,
                          color: e.target.value,
                        })
                      }
                      className={`w-20 p-1 border rounded ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <option value="bg-blue-600">Blue</option>
                      <option value="bg-green-600">Green</option>
                      <option value="bg-purple-600">Purple</option>
                      <option value="bg-red-600">Red</option>
                      <option value="bg-yellow-600">Yellow</option>
                      <option value="bg-indigo-600">Indigo</option>
                    </select>
                    <input
                      type="text"
                      value={editingFolder.name}
                      onChange={(e) =>
                        setEditingFolder({
                          ...editingFolder,
                          name: e.target.value,
                        })
                      }
                      className={`flex-1 p-1 border rounded ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${folder.color}`}></div>
                    <span
                      className={isDarkMode ? "text-white" : "text-gray-900"}
                    >
                      {folder.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {editingFolder?.id === folder.id ? (
                    <>
                      <button
                        onClick={() => {
                          onUpdateFolder(folder.id, {
                            name: editingFolder.name,
                            color: editingFolder.color,
                          });
                          setEditingFolder(null);
                        }}
                        className="text-green-500 hover:text-green-700 p-1"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingFolder(null)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingFolder(folder)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteFolder(folder.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h5
            className={`text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Projects
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              >
                {editingProject?.id === project.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={editingProject.color}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          color: e.target.value,
                        })
                      }
                      className={`w-20 p-1 border rounded ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <option value="bg-blue-500">Blue</option>
                      <option value="bg-green-500">Green</option>
                      <option value="bg-purple-500">Purple</option>
                      <option value="bg-red-500">Red</option>
                      <option value="bg-yellow-500">Yellow</option>
                      <option value="bg-indigo-500">Indigo</option>
                    </select>
                    <input
                      type="text"
                      value={editingProject.name}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          name: e.target.value,
                        })
                      }
                      className={`flex-1 p-1 border rounded ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    />
                    <select
                      value={editingProject.folderId || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          folderId: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className={`w-32 p-1 border rounded ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <option value="">No Folder</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${project.color}`}></div>
                    <span
                      className={isDarkMode ? "text-white" : "text-gray-900"}
                    >
                      {project.name}
                    </span>
                    {project.folderId && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getFolderById(project.folderId)?.name}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {editingProject?.id === project.id ? (
                    <>
                      <button
                        onClick={() => {
                          onUpdateProject(project.id, {
                            name: editingProject.name,
                            color: editingProject.color,
                            folderId: editingProject.folderId,
                          });
                          setEditingProject(null);
                        }}
                        className="text-green-500 hover:text-green-700 p-1"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingProject(null)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingProject(project)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setShowProjectForm(false)}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? "bg-gray-600 hover:bg-gray-500 text-white"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }`}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default ProjectManagement;
