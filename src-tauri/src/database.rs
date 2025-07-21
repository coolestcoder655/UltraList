use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::fs;
use chrono::{Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub due_date: Option<String>,
    pub priority: String,
    pub completed: bool,
    pub project_id: Option<i32>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Subtask {
    pub id: String,
    pub task_id: String,
    pub text: String,
    pub completed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: i32,
    pub name: String,
    pub color: String,
    pub description: Option<String>,
    pub folder_id: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Folder {
    pub id: i32,
    pub name: String,
    pub color: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub task_id: String,
    pub tag: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskWithDetails {
    pub task: Task,
    pub subtasks: Vec<Subtask>,
    pub tags: Vec<String>,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        let app_data_dir = Self::get_app_data_dir()?;
        fs::create_dir_all(&app_data_dir).map_err(|e| {
            rusqlite::Error::SqliteFailure(
                rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_CANTOPEN),
                Some(format!("Failed to create app data directory: {}", e)),
            )
        })?;

        let db_path = app_data_dir.join("ultralist.db");
        let conn = Connection::open(db_path)?;
        
        let db = Database { conn };
        db.init_tables()?;
        Ok(db)
    }

    fn get_app_data_dir() -> Result<PathBuf> {
        let home_dir = dirs::home_dir().ok_or_else(|| {
            rusqlite::Error::SqliteFailure(
                rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_CANTOPEN),
                Some("Could not find home directory".to_string()),
            )
        })?;
        Ok(home_dir.join(".ultralist"))
    }

    fn init_tables(&self) -> Result<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                color TEXT NOT NULL,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                color TEXT NOT NULL,
                description TEXT,
                folder_id INTEGER,
                FOREIGN KEY (folder_id) REFERENCES folders (id)
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                due_date TEXT,
                priority TEXT NOT NULL DEFAULT 'medium',
                completed BOOLEAN NOT NULL DEFAULT 0,
                project_id INTEGER,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            );

            CREATE TABLE IF NOT EXISTS subtasks (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                text TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0,
                FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tags (
                task_id TEXT NOT NULL,
                tag TEXT NOT NULL,
                PRIMARY KEY (task_id, tag),
                FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
            CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
            CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
            CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
            CREATE INDEX IF NOT EXISTS idx_tags_task_id ON tags(task_id);
            "
        )?;

        // Insert default theme setting if not exists
        self.conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'light')",
            [],
        )?;

        // Insert default searchbar mode setting if not exists
        self.conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('searchbar_mode', 'search')",
            [],
        )?;

        // Seed initial data if tables are empty
        self.seed_initial_data()?;

        Ok(())
    }

    fn seed_initial_data(&self) -> Result<()> {
        // Check if folders table is empty
        let mut stmt = self.conn.prepare("SELECT COUNT(*) FROM folders")?;
        let folder_count: i64 = stmt.query_row([], |row| row.get(0))?;

        if folder_count == 0 {
            // Insert initial folders
            self.conn.execute(
                "INSERT INTO folders (id, name, color, description) VALUES (1, 'Work & Career', 'bg-blue-600', 'Professional projects and development')",
                [],
            )?;
            self.conn.execute(
                "INSERT INTO folders (id, name, color, description) VALUES (2, 'Life & Wellness', 'bg-green-600', 'Personal growth and health')",
                [],
            )?;

            // Insert initial projects
            self.conn.execute(
                "INSERT INTO projects (id, name, color, description, folder_id) VALUES (1, 'Work', 'bg-blue-500', 'Work-related tasks', 1)",
                [],
            )?;
            self.conn.execute(
                "INSERT INTO projects (id, name, color, description, folder_id) VALUES (2, 'Personal', 'bg-green-500', 'Personal tasks and errands', 2)",
                [],
            )?;
            self.conn.execute(
                "INSERT INTO projects (id, name, color, description, folder_id) VALUES (3, 'Health', 'bg-purple-500', 'Health and fitness goals', 2)",
                [],
            )?;
        }

        Ok(())
    }

    // Task operations
    pub fn save_task(&self, task: &Task) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO tasks (id, title, description, due_date, priority, completed, project_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                task.id,
                task.title,
                task.description,
                task.due_date,
                task.priority,
                task.completed,
                task.project_id,
                task.created_at,
                task.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn get_all_tasks(&self) -> Result<Vec<TaskWithDetails>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, description, due_date, priority, completed, project_id, created_at, updated_at FROM tasks ORDER BY created_at DESC"
        )?;

        let task_iter = stmt.query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                due_date: row.get(3)?,
                priority: row.get(4)?,
                completed: row.get(5)?,
                project_id: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })?;

        let mut tasks_with_details = Vec::new();
        for task in task_iter {
            let task = task?;
            let subtasks = self.get_subtasks_for_task(&task.id)?;
            let tags = self.get_tags_for_task(&task.id)?;
            
            tasks_with_details.push(TaskWithDetails {
                task,
                subtasks,
                tags,
            });
        }

        Ok(tasks_with_details)
    }

    pub fn delete_task(&self, task_id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM tasks WHERE id = ?1", params![task_id])?;
        Ok(())
    }

    pub fn update_task_completion(&self, task_id: &str, completed: bool) -> Result<()> {
        let now = Utc::now().to_rfc3339();
        self.conn.execute(
            "UPDATE tasks SET completed = ?1, updated_at = ?2 WHERE id = ?3",
            params![completed, now, task_id],
        )?;
        Ok(())
    }

    // Subtask operations
    pub fn save_subtask(&self, subtask: &Subtask) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO subtasks (id, task_id, text, completed) VALUES (?1, ?2, ?3, ?4)",
            params![subtask.id, subtask.task_id, subtask.text, subtask.completed],
        )?;
        Ok(())
    }

    pub fn get_subtasks_for_task(&self, task_id: &str) -> Result<Vec<Subtask>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, task_id, text, completed FROM subtasks WHERE task_id = ?1"
        )?;

        let subtask_iter = stmt.query_map([task_id], |row| {
            Ok(Subtask {
                id: row.get(0)?,
                task_id: row.get(1)?,
                text: row.get(2)?,
                completed: row.get(3)?,
            })
        })?;

        let mut subtasks = Vec::new();
        for subtask in subtask_iter {
            subtasks.push(subtask?);
        }
        Ok(subtasks)
    }

    pub fn delete_subtask(&self, subtask_id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM subtasks WHERE id = ?1", params![subtask_id])?;
        Ok(())
    }

    // Tag operations
    pub fn save_tags_for_task(&self, task_id: &str, tags: &[String]) -> Result<()> {
        // Delete existing tags for this task
        self.conn.execute("DELETE FROM tags WHERE task_id = ?1", params![task_id])?;
        
        // Insert new tags
        for tag in tags {
            self.conn.execute(
                "INSERT INTO tags (task_id, tag) VALUES (?1, ?2)",
                params![task_id, tag],
            )?;
        }
        Ok(())
    }

    pub fn get_tags_for_task(&self, task_id: &str) -> Result<Vec<String>> {
        let mut stmt = self.conn.prepare("SELECT tag FROM tags WHERE task_id = ?1")?;
        let tag_iter = stmt.query_map([task_id], |row| Ok(row.get::<_, String>(0)?))?;

        let mut tags = Vec::new();
        for tag in tag_iter {
            tags.push(tag?);
        }
        Ok(tags)
    }

    pub fn get_all_tags(&self) -> Result<Vec<String>> {
        let mut stmt = self.conn.prepare("SELECT DISTINCT tag FROM tags ORDER BY tag")?;
        let tag_iter = stmt.query_map([], |row| Ok(row.get::<_, String>(0)?))?;

        let mut tags = Vec::new();
        for tag in tag_iter {
            tags.push(tag?);
        }
        Ok(tags)
    }

    // Project operations
    pub fn save_project(&self, project: &Project) -> Result<()> {
        if project.id == 0 {
            // New project - let SQLite auto-increment the ID
            self.conn.execute(
                "INSERT INTO projects (name, color, description, folder_id) VALUES (?1, ?2, ?3, ?4)",
                params![project.name, project.color, project.description, project.folder_id],
            )?;
        } else {
            // Update existing project
            self.conn.execute(
                "INSERT OR REPLACE INTO projects (id, name, color, description, folder_id) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![project.id, project.name, project.color, project.description, project.folder_id],
            )?;
        }
        Ok(())
    }

    pub fn get_all_projects(&self) -> Result<Vec<Project>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, color, description, folder_id FROM projects ORDER BY name"
        )?;

        let project_iter = stmt.query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                description: row.get(3)?,
                folder_id: row.get(4)?,
            })
        })?;

        let mut projects = Vec::new();
        for project in project_iter {
            projects.push(project?);
        }
        Ok(projects)
    }

    pub fn delete_project(&self, project_id: i32) -> Result<()> {
        self.conn.execute("DELETE FROM projects WHERE id = ?1", params![project_id])?;
        Ok(())
    }

    // Folder operations
    pub fn save_folder(&self, folder: &Folder) -> Result<()> {
        if folder.id == 0 {
            // New folder - let SQLite auto-increment the ID
            self.conn.execute(
                "INSERT INTO folders (name, color, description) VALUES (?1, ?2, ?3)",
                params![folder.name, folder.color, folder.description],
            )?;
        } else {
            // Update existing folder
            self.conn.execute(
                "INSERT OR REPLACE INTO folders (id, name, color, description) VALUES (?1, ?2, ?3, ?4)",
                params![folder.id, folder.name, folder.color, folder.description],
            )?;
        }
        Ok(())
    }

    pub fn get_all_folders(&self) -> Result<Vec<Folder>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, color, description FROM folders ORDER BY name"
        )?;

        let folder_iter = stmt.query_map([], |row| {
            Ok(Folder {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                description: row.get(3)?,
            })
        })?;

        let mut folders = Vec::new();
        for folder in folder_iter {
            folders.push(folder?);
        }
        Ok(folders)
    }

    pub fn delete_folder(&self, folder_id: i32) -> Result<()> {
        self.conn.execute("DELETE FROM folders WHERE id = ?1", params![folder_id])?;
        Ok(())
    }

    // Settings operations
    pub fn save_setting(&self, key: &str, value: &str) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
            params![key, value],
        )?;
        Ok(())
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let mut stmt = self.conn.prepare("SELECT value FROM settings WHERE key = ?1")?;
        let mut rows = stmt.query_map([key], |row| Ok(row.get::<_, String>(0)?))?;
        
        match rows.next() {
            Some(row) => Ok(Some(row?)),
            None => Ok(None),
        }
    }

    // pub fn get_all_settings(&self) -> Result<Vec<Settings>> {
    //     let mut stmt = self.conn.prepare("SELECT key, value FROM settings")?;
    //     let setting_iter = stmt.query_map([], |row| {
    //         Ok(Settings {
    //             key: row.get(0)?,
    //             value: row.get(1)?,
    //         })
    //     })?;

    //     let mut settings = Vec::new();
    //     for setting in setting_iter {
    //         settings.push(setting?);
    //     }
    //     Ok(settings)
    // }

    // Theme specific operations
    pub fn set_theme(&self, theme: &str) -> Result<()> {
        self.save_setting("theme", theme)
    }

    pub fn get_theme(&self) -> Result<String> {
        Ok(self.get_setting("theme")?.unwrap_or_else(|| "light".to_string()))
    }

    // Mobile mode specific operations
    pub fn set_mobile_mode(&self, enabled: bool) -> Result<()> {
        let value = if enabled { "true" } else { "false" };
        self.save_setting("mobile_mode", value)
    }

    pub fn get_mobile_mode(&self) -> Result<bool> {
        let setting = self.get_setting("mobile_mode")?.unwrap_or_else(|| "false".to_string());
        Ok(setting == "true")
    }
}
