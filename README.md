# UltraList

> A modern, feature-rich task management application built with React, TypeScript, Tauri, and SQLite

![UltraList Banner](https://img.shields.io/badge/Version-0.1.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Desktop-orange?style=for-the-badge)

## 🚀 Overview

UltraList is a comprehensive task management application designed to boost productivity through multiple organizational views and intelligent features. Built as a desktop application using Tauri, it combines the flexibility of web technologies with the performance of native applications.

## ✨ Key Features

### 📋 Core Task Management

- **Complete Task System**: Create, edit, delete, and organize tasks with rich metadata
- **Subtask Support**: Break down complex tasks into manageable subtasks
- **Priority Levels**: High, medium, and low priority classification
- **Due Dates & Deadlines**: Set and track important deadlines
- **Tag System**: Organize tasks with customizable tags
- **Project & Folder Organization**: Group related tasks into projects and folders

### 🎯 Multiple Productivity Views

#### 📝 List View

- Traditional task list with all details
- Expandable subtasks
- Quick edit capabilities
- Sorting and filtering options

#### 📊 Kanban Board

- Visual task flow management
- Three columns: To Do, In Progress, Done
- Drag-and-drop functionality (planned)
- Progress tracking with subtask completion

#### 📅 Gantt Chart

- Timeline visualization for project planning
- Visual representation of task deadlines
- Overdue task highlighting
- Today indicator for current progress

#### 🎯 Eisenhower Matrix

- Four-quadrant priority classification:
  - **Do First**: Urgent & Important (crises, emergencies)
  - **Schedule**: Not Urgent & Important (planning, development)
  - **Delegate**: Urgent & Not Important (interruptions, some calls)
  - **Eliminate**: Not Urgent & Not Important (time wasters)
- Automatic categorization based on priority and due dates

#### ⏱️ Pomodoro Timer

- Built-in productivity timer with multiple modes:
  - **Classic Pomodoro**: 25-minute work sessions
  - **Deep Work**: 90-minute focused sessions
  - **Short Focus**: 15-minute quick sessions
  - **Custom Timer**: User-defined durations
- Configurable break intervals
- Session tracking and statistics
- Task selection for focused work
- Browser notifications

### 🧠 Smart Features

#### 🗣️ Natural Language Processing

- Intelligent task creation from natural language input
- Examples:
  - "Buy groceries tomorrow at 5pm" → Task with due date and time
  - "High priority meeting next Friday" → High priority task with due date
  - "Call mom this weekend #family" → Task with tag and relative date
- Automatic extraction of:
  - Due dates (relative and absolute)
  - Times (12-hour and 24-hour formats)
  - Priority levels
  - Tags
  - Project assignments

#### 🔍 Advanced Search & Filtering

- **Search Modes**: Toggle between search and create modes
- **Smart Filtering**: Filter by completion, priority, project, due date
- **Sorting Options**: Sort by date, priority, title, or project
- **Saved Searches**: Store frequently used search queries
- **Real-time Suggestions**: Autocomplete and suggestions

### 💾 Robust Data Management

#### 🗄️ SQLite Database Integration

- **Persistent Storage**: All data stored locally in SQLite database
- **Location**: `~/.ultralist/ultralist.db`
- **Backup-Friendly**: Single file database for easy backup
- **Performance**: Optimized with indexes for fast queries
- **Reliability**: ACID compliance and foreign key constraints

#### 🔄 Database Schema

- **Tasks**: Core task data with metadata
- **Subtasks**: Linked to parent tasks with cascade delete
- **Tags**: Many-to-many relationship with tasks
- **Projects**: Organizational containers with color coding
- **Folders**: Higher-level organization for projects
- **Settings**: Persistent application preferences

### 🎨 User Experience

#### 🌓 Theme System

- **Dark Mode**: Easy on the eyes for extended use
- **Light Mode**: Clean and bright interface
- **Persistent Settings**: Theme choice saved across sessions
- **Smooth Transitions**: Animated theme switching

#### 📱 Responsive Design

- **Adaptive Layout**: Works across different screen sizes
- **Touch-Friendly**: Optimized for touch interactions
- **Keyboard Shortcuts**: Comprehensive keyboard shortcuts for all major actions

#### ⌨️ Keyboard Shortcuts

UltraList includes comprehensive keyboard shortcuts for power users:

- **Alt + T**: Create new task
- **Alt + E**: Edit selected task
- **Alt + D**: Delete selected task
- **Alt + L**: Switch to List View
- **Alt + K**: Switch to Kanban View
- **Alt + G**: Switch to Gantt Chart View
- **Alt + M**: Switch to Eisenhower Matrix
- **Alt + P**: Open Pomodoro Timer
- **Alt + S**: Start Pomodoro session
- **Alt + F**: Open Advanced Search
- **Alt + C**: Create task from natural language
- **Alt + R**: Refresh current view
- **Alt + H**: Show/hide completed tasks
- **Alt + U**: Toggle theme (Dark/Light)

_Click the info icon (ⓘ) next to the theme toggle to view all shortcuts_

### 🔧 Technical Features

#### ⚡ Performance

- **Native Performance**: Tauri-based desktop application
- **Fast Startup**: Optimized initialization and data loading
- **Efficient Updates**: Real-time UI updates without page refreshes
- **Memory Management**: Rust backend for optimal resource usage

#### 🔒 Data Security

- **Local Storage**: All data remains on your device
- **No Cloud Dependencies**: Fully offline-capable
- **Privacy-First**: No data collection or tracking
- **Secure Architecture**: Rust backend prevents common vulnerabilities

## 🏗️ Architecture

### Frontend Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with full IntelliSense
- **Tailwind CSS**: Utility-first styling with dark mode support
- **Vite**: Fast development server and optimized builds
- **Lucide React**: Beautiful, consistent iconography

### Backend Stack

- **Tauri**: Rust-based desktop application framework
- **SQLite**: Embedded database with full SQL support
- **Rust**: Memory-safe systems programming language
- **Serde**: Efficient serialization/deserialization

### Database Design

```sql
-- Core schema structure
Tasks ──→ Subtasks (1:many)
Tasks ──→ Tags (many:many)
Tasks ──→ Projects (many:1)
Projects ──→ Folders (many:1)
Settings (key-value store)
```

## 🚧 Development Status

### ✅ Completed Features

- [x] Complete SQLite database integration
- [x] All productivity views (List, Kanban, Gantt, Eisenhower, Pomodoro)
- [x] Natural language task parsing
- [x] Project and folder management
- [x] Theme system with persistence
- [x] Advanced search and filtering
- [x] Task and subtask management
- [x] Priority and due date handling
- [x] Tag system
- [x] Pomodoro timer with multiple modes
- [x] Keyboard shortcuts

### 🔄 In Progress

- [ ] Theme system refinements
- [ ] Performance optimizations
- [ ] UI/UX improvements

### 📋 Planned Features

- [ ] Drag-and-drop task management
- [ ] Progress tracking and analytics
- [ ] Focus mode
- [ ] Backlog management
- [ ] Export/import functionality
- [ ] Plugin system
- [ ] Mobile companion app

## 🛠️ Technology Highlights

### Why Tauri?

- **Performance**: Native performance with web UI flexibility
- **Security**: Sandboxed environment with explicit permissions
- **Size**: Smaller bundle size compared to Electron
- **Cross-Platform**: Windows, macOS, and Linux support

### Why SQLite?

- **Reliability**: Battle-tested database with ACID compliance
- **Performance**: Optimized for local applications
- **Simplicity**: Single file database with no server required
- **Portability**: Database file can be easily backed up or moved

### Development Experience

- **Hot Reload**: Instant feedback during development
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Modern Tooling**: Latest development tools and best practices
- **Maintainable Code**: Clean architecture with separation of concerns

## 🔍 Project Structure

```
UltraList/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── views/              # Productivity views
│   │   │   ├── KanbanView.tsx
│   │   │   ├── GanttView.tsx
│   │   │   ├── EisenhowerView.tsx
│   │   │   └── PomodoroView.tsx
│   │   ├── SearchBar/          # Advanced search components
│   │   └── *.tsx               # Core UI components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useDatabase.ts      # Database integration
│   │   ├── useTasks.ts         # Task management
│   │   └── *.ts                # Other custom hooks
│   ├── services/               # Business logic
│   │   ├── databaseService.ts  # Database operations
│   │   └── naturalLanguageParser.ts # NLP features
│   ├── types/                  # TypeScript definitions
│   └── utils/                  # Utility functions
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── commands.rs         # Tauri command handlers
│   │   ├── database.rs         # SQLite operations
│   │   ├── lib.rs              # Main Tauri setup
│   │   └── main.rs             # Entry point
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
├── public/                     # Static assets
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

## 🎯 Use Cases

### Personal Productivity

- Daily task management and planning
- Goal tracking and habit formation
- Time management with Pomodoro technique
- Priority-based task organization

### Project Management

- Software development project tracking
- Research project organization
- Creative project workflows
- Academic assignment management

### Team Collaboration

- Individual contribution to team projects
- Personal task management within larger projects
- Meeting preparation and follow-up tasks
- Deadline tracking and reporting

## 🏆 What Makes UltraList Special

1. **Multiple Mental Models**: Different people think differently about tasks - UltraList provides multiple views to match your thinking style

2. **Intelligent Input**: Natural language processing makes task creation intuitive and fast

3. **Local-First**: Your data stays on your device - no cloud dependencies or privacy concerns

4. **Performance**: Native desktop performance with modern web UI flexibility

5. **Extensible**: Built with modularity in mind for future enhancements

6. **Developer-Friendly**: Clean, well-documented codebase for easy contribution

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

<div align="center">
  <sub>Built with ❤️ using React, TypeScript, Tauri, and SQLite</sub>
</div>
