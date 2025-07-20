use crate::database::{Database, Task, Subtask, Project, Folder, TaskWithDetails};
use tauri::State;
use std::sync::Mutex;
use uuid::Uuid;
use chrono::Utc;
use serde::{Deserialize, Serialize};

pub type DatabaseState = Mutex<Database>;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTaskRequest {
    pub title: String,
    pub description: String,
    pub due_date: Option<String>,
    pub priority: String,
    pub project_id: Option<i32>,
    pub subtasks: Vec<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTaskRequest {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub priority: Option<String>,
    pub project_id: Option<i32>,
    pub completed: Option<bool>,
    pub subtasks: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
}

// Task Commands
#[tauri::command]
pub async fn create_task(
    request: CreateTaskRequest,
    db: State<'_, DatabaseState>,
) -> Result<String, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let task_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let task = Task {
        id: task_id.clone(),
        title: request.title,
        description: request.description,
        due_date: request.due_date,
        priority: request.priority,
        completed: false,
        project_id: request.project_id,
        created_at: now.clone(),
        updated_at: now,
    };

    db.save_task(&task).map_err(|e| format!("Failed to save task: {}", e))?;

    // Save subtasks
    for subtask_text in request.subtasks.iter() {
        let subtask = Subtask {
            id: Uuid::new_v4().to_string(),
            task_id: task_id.clone(),
            text: subtask_text.clone(),
            completed: false,
        };
        db.save_subtask(&subtask).map_err(|e| format!("Failed to save subtask: {}", e))?;
    }

    // Save tags
    db.save_tags_for_task(&task_id, &request.tags)
        .map_err(|e| format!("Failed to save tags: {}", e))?;

    Ok(task_id)
}

#[tauri::command]
pub async fn get_all_tasks(db: State<'_, DatabaseState>) -> Result<Vec<TaskWithDetails>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_all_tasks().map_err(|e| format!("Failed to get tasks: {}", e))
}

#[tauri::command]
pub async fn update_task(
    request: UpdateTaskRequest,
    db: State<'_, DatabaseState>,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    // Get existing task
    let tasks = db.get_all_tasks().map_err(|e| format!("Failed to get tasks: {}", e))?;
    let mut task = tasks.into_iter()
        .find(|t| t.task.id == request.id)
        .ok_or("Task not found")?
        .task;

    // Update fields if provided
    if let Some(title) = request.title {
        task.title = title;
    }
    if let Some(description) = request.description {
        task.description = description;
    }
    if let Some(due_date) = request.due_date {
        task.due_date = Some(due_date);
    }
    if let Some(priority) = request.priority {
        task.priority = priority;
    }
    if let Some(project_id) = request.project_id {
        task.project_id = Some(project_id);
    }
    if let Some(completed) = request.completed {
        task.completed = completed;
    }
    
    task.updated_at = Utc::now().to_rfc3339();

    db.save_task(&task).map_err(|e| format!("Failed to update task: {}", e))?;

    // Update subtasks if provided
    if let Some(subtask_texts) = request.subtasks {
        // Delete existing subtasks
        let existing_subtasks = db.get_subtasks_for_task(&task.id)
            .map_err(|e| format!("Failed to get subtasks: {}", e))?;
        for subtask in existing_subtasks {
            db.delete_subtask(&subtask.id)
                .map_err(|e| format!("Failed to delete subtask: {}", e))?;
        }

        // Create new subtasks
        for subtask_text in subtask_texts {
            let subtask = Subtask {
                id: Uuid::new_v4().to_string(),
                task_id: task.id.clone(),
                text: subtask_text,
                completed: false,
            };
            db.save_subtask(&subtask)
                .map_err(|e| format!("Failed to save subtask: {}", e))?;
        }
    }

    // Update tags if provided
    if let Some(tags) = request.tags {
        db.save_tags_for_task(&task.id, &tags)
            .map_err(|e| format!("Failed to save tags: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub async fn delete_task(task_id: String, db: State<'_, DatabaseState>) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.delete_task(&task_id).map_err(|e| format!("Failed to delete task: {}", e))
}

#[tauri::command]
pub async fn toggle_task_completion(
    task_id: String,
    completed: bool,
    db: State<'_, DatabaseState>,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.update_task_completion(&task_id, completed)
        .map_err(|e| format!("Failed to update task completion: {}", e))
}

// Subtask Commands
#[tauri::command]
pub async fn toggle_subtask_completion(
    subtask_id: String,
    completed: bool,
    db: State<'_, DatabaseState>,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    println!("Attempting to toggle subtask with ID: {}", subtask_id);
    
    // Get existing subtask (we need to reconstruct it with updated completion)
    // This is a bit inefficient but works with the current structure
    let tasks = db.get_all_tasks().map_err(|e| format!("Failed to get tasks: {}", e))?;
    
    for task_with_details in tasks {
        println!("Checking task: {} with {} subtasks", task_with_details.task.id, task_with_details.subtasks.len());
        for subtask in task_with_details.subtasks {
            println!("  Subtask ID: {}, Text: {}", subtask.id, subtask.text);
            if subtask.id == subtask_id {
                println!("Found matching subtask! Updating completion to: {}", completed);
                let updated_subtask = Subtask {
                    id: subtask.id,
                    task_id: subtask.task_id,
                    text: subtask.text,
                    completed,
                };
                return db.save_subtask(&updated_subtask)
                    .map_err(|e| format!("Failed to update subtask: {}", e));
            }
        }
    }
    
    println!("Subtask with ID {} not found in any task!", subtask_id);
    Err("Subtask not found".to_string())
}

// Project Commands
#[tauri::command]
pub async fn create_project(
    name: String,
    color: String,
    description: Option<String>,
    folder_id: Option<i32>,
    db: State<'_, DatabaseState>,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let project = Project {
        id: 0, // Will be auto-incremented
        name,
        color,
        description,
        folder_id,
    };

    db.save_project(&project).map_err(|e| format!("Failed to save project: {}", e))
}

#[tauri::command]
pub async fn get_all_projects(db: State<'_, DatabaseState>) -> Result<Vec<Project>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_all_projects().map_err(|e| format!("Failed to get projects: {}", e))
}

#[tauri::command]
pub async fn delete_project(project_id: i32, db: State<'_, DatabaseState>) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.delete_project(project_id).map_err(|e| format!("Failed to delete project: {}", e))
}

// Folder Commands
#[tauri::command]
pub async fn create_folder(
    name: String,
    color: String,
    description: Option<String>,
    db: State<'_, DatabaseState>,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let folder = Folder {
        id: 0, // Will be auto-incremented
        name,
        color,
        description,
    };

    db.save_folder(&folder).map_err(|e| format!("Failed to save folder: {}", e))
}

#[tauri::command]
pub async fn get_all_folders(db: State<'_, DatabaseState>) -> Result<Vec<Folder>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_all_folders().map_err(|e| format!("Failed to get folders: {}", e))
}

#[tauri::command]
pub async fn delete_folder(folder_id: i32, db: State<'_, DatabaseState>) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.delete_folder(folder_id).map_err(|e| format!("Failed to delete folder: {}", e))
}

// Tag Commands
#[tauri::command]
pub async fn get_all_tags(db: State<'_, DatabaseState>) -> Result<Vec<String>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_all_tags().map_err(|e| format!("Failed to get tags: {}", e))
}

// Settings Commands
#[tauri::command]
pub async fn set_theme(theme: String, db: State<'_, DatabaseState>) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.set_theme(&theme).map_err(|e| format!("Failed to set theme: {}", e))
}

#[tauri::command]
pub async fn get_theme(db: State<'_, DatabaseState>) -> Result<String, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_theme().map_err(|e| format!("Failed to get theme: {}", e))
}

#[tauri::command]
pub async fn save_setting(
    key: String,
    value: String,
    db: State<'_, DatabaseState>,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.save_setting(&key, &value).map_err(|e| format!("Failed to save setting: {}", e))
}

#[tauri::command]
pub async fn get_setting(key: String, db: State<'_, DatabaseState>) -> Result<Option<String>, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.get_setting(&key).map_err(|e| format!("Failed to get setting: {}", e))
}

// SearchBar Mode Commands
#[tauri::command]
pub async fn set_searchbar_mode(mode: String, db: State<'_, DatabaseState>) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    db.save_setting("searchbar_mode", &mode).map_err(|e| format!("Failed to set searchbar mode: {}", e))
}

#[tauri::command]
pub async fn get_searchbar_mode(db: State<'_, DatabaseState>) -> Result<String, String> {
    let db = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let mode = db.get_setting("searchbar_mode").map_err(|e| format!("Failed to get searchbar mode: {}", e))?;
    Ok(mode.unwrap_or_else(|| "search".to_string())) // Default to search mode
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NaturalLanguageTaskRequest {
    pub input: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedTask {
    pub title: String,
    pub description: String,
    pub due_date: Option<String>,
    pub priority: String,
    pub tags: Vec<String>,
    pub project_name: Option<String>,
}

#[tauri::command]
pub async fn parse_natural_language_task(
    request: NaturalLanguageTaskRequest,
) -> Result<ParsedTask, String> {
    // Basic natural language parsing
    let input = request.input.to_lowercase();
    let mut title = request.input.clone();
    let mut description = String::new();
    let mut due_date: Option<String> = None;
    let mut priority = "medium".to_string();
    let mut tags: Vec<String> = Vec::new();
    let mut project_name: Option<String> = None;

    // Extract priority keywords
    if input.contains("urgent") || input.contains("asap") || input.contains("critical") {
        priority = "high".to_string();
        title = title.replace("urgent", "").replace("asap", "").replace("critical", "");
    } else if input.contains("low priority") || input.contains("later") || input.contains("someday") {
        priority = "low".to_string();
        title = title.replace("low priority", "").replace("later", "").replace("someday", "");
    }

    // Extract date keywords
    let now = chrono::Utc::now();
    if input.contains("today") {
        due_date = Some(now.format("%Y-%m-%d").to_string());
        title = title.replace("today", "");
    } else if input.contains("tomorrow") {
        let tomorrow = now + chrono::Duration::days(1);
        due_date = Some(tomorrow.format("%Y-%m-%d").to_string());
        title = title.replace("tomorrow", "");
    } else if input.contains("next week") {
        let next_week = now + chrono::Duration::weeks(1);
        due_date = Some(next_week.format("%Y-%m-%d").to_string());
        title = title.replace("next week", "");
    }

    // Extract time patterns (e.g., "at 5pm", "by 3:30")
    let time_regex = regex::Regex::new(r"\b(?:at|by)\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?\b").unwrap();
    if let Some(captures) = time_regex.find(&input) {
        // If we have a time, add it to description
        description.push_str(&format!("Due time: {}", captures.as_str()));
        title = time_regex.replace(&title, "").to_string();
    }

    // Extract hashtags as tags
    let hashtag_regex = regex::Regex::new(r"#(\w+)").unwrap();
    for capture in hashtag_regex.captures_iter(&input) {
        if let Some(tag) = capture.get(1) {
            tags.push(tag.as_str().to_string());
        }
    }
    title = hashtag_regex.replace_all(&title, "").to_string();

    // Extract project mentions (e.g., "for work project", "in personal")
    let project_regex = regex::Regex::new(r"\b(?:for|in)\s+(\w+(?:\s+\w+)?)\s+project\b").unwrap();
    if let Some(captures) = project_regex.captures(&input) {
        if let Some(project) = captures.get(1) {
            project_name = Some(project.as_str().to_string());
            title = project_regex.replace(&title, "").to_string();
        }
    }

    // Clean up title
    title = title.trim().to_string();
    if title.is_empty() {
        title = "New task".to_string();
    }

    Ok(ParsedTask {
        title,
        description,
        due_date,
        priority,
        tags,
        project_name,
    })
}
