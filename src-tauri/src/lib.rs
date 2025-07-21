// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod database;
mod commands;

use database::Database;
use commands::*;
use std::sync::Mutex;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize database
    let database = Database::new().expect("Failed to initialize database");
    let db_state = Mutex::new(database);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(db_state)
        .invoke_handler(tauri::generate_handler![
            greet,
            // Task commands
            create_task,
            get_all_tasks,
            update_task,
            delete_task,
            toggle_task_completion,
            // Subtask commands
            toggle_subtask_completion,
            // Project commands
            create_project,
            get_all_projects,
            delete_project,
            // Folder commands
            create_folder,
            get_all_folders,
            delete_folder,
            // Tag commands
            get_all_tags,
            // Settings commands
            set_theme,
            get_theme,
            set_mobile_mode,
            get_mobile_mode,
            save_setting,
            get_setting,
            // SearchBar Mode commands
            set_searchbar_mode,
            get_searchbar_mode,
            parse_natural_language_task,
            // Logging commands
            get_application_logs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
