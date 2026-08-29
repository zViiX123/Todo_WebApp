# ✦ Todo Board Studio (Desktop)

A sleek, offline-first Kanban board & project management desktop application built with **Electron**, modern **HTML5/CSS3**, and **JavaScript**.

Organize tasks across multiple boards, track time automatically with checklist-driven timers, categorize with tags, set due dates, customize themes, and export/backup your data locally.

---

## ✨ Features

### 📋 Multi-Board Management
* Create, rename, switch, and delete independent boards (`Ctrl + B`).
* Each board preserves its own columns, tasks, colors, themes, and configuration.

### 🗂️ Kanban Columns & Customization
* **Dynamic Columns**: Add, rename directly in place, or delete with an automatic 5-second undo toast.
* **✨ Smooth Drag & Drop Reordering**: Fluidly drag and drop columns or cards with live transparent preview placeholders showing exact drop positions.
* **📌 Single Pinned Column with Swapping**: Pin any column (`📌`) to highlight and lock it at the front. Pinning a second column cleanly swaps places with the previously pinned column.
* **📁 Dedicated Folded Columns Dock**: Folding a column (`◀`) moves it smoothly to a compact dedicated left rail shelf with color dots and task counts. **Unfolding any column automatically places it at the last position**.
* **Color Customization**: Pick custom background colors per column with automatic font brightness contrast calculation.
* **Quick Sort**: Instantly sort tasks in a specific column alphabetically (`⇅`).

### ⏱️ Checklist-Driven Time Tracking & Live Ticking
* **Automatic Timers**: Check the **`Started`** subtask to start the timer (`startDate` stamped).
* **🟢 Real-Time Ticking**: In-progress timers tick automatically in real-time on board cards and in task detail views every 10 seconds without needing manual refreshes.
* **Progress Tracking**: Intermediate subtasks keep track of progress (`1/3`, `2/3`).
* **Completion Timestamp**: Check **`Finished`** to stop the timer (`completedDate` stamped) and lock in total duration taken.
* **Persistent Duration**: Calculates elapsed time against real-world wall-clock timestamps—duration is maintained accurately even when closing and reopening the app.
* **Protected Anchor Subtasks**: Every task initializes with **`Started`** and **`Finished`** subtasks. `Finished` remains anchored at the bottom, and both steps are protected from deletion or accidental renaming.

### 📦 Dedicated Task Archive Vault
* **Separate Archive Storage**: Keep completed boards and columns clean by archiving finished tasks into a dedicated vault.
* **Vault Management**: View archived tasks with duration, column origin, priority, and tags.
* **Restore & Permanent Delete**: Restore tasks back to any active board or delete individual/all archived records permanently.
* **Batch Archiving**: 1-click **Archive All Completed** button to archive all completed tasks from the active board.

### 📊 Productivity & Metrics Dashboard
* Click **📊 Stats** in the header to view an analytics dashboard:
* **Key Metrics**: Total Tasks, Completion Rate %, Average Duration per task, and Total Tracked Work Hours.
* **Priority Distribution**: Visual color-coded percentage bar across High, Medium, Low, and None priorities.
* **Stage & Column Breakdown**: Real-time breakdown of tasks across workflow stages.
* **Momentum & Velocity**: Tasks completed today counter and total subtask progress metrics.

### 📝 Rich Task Details & Markdown Editor
Click on any task card (or click `✏️`) to open the Task Detail Modal:
* **🖋️ Markdown Support**: Write rich descriptions with headings (`#`), bold/italic (`**`, `*`), bullet/task lists (`- [x]`), blockquotes (`>`), code blocks, inline code, and links.
* **Live Tab Switcher**: Seamlessly toggle between **`✏️ Edit`** and **`👁️ Preview (MD)`**.
* **📋 Activity & History Log**: View an audit timeline of all modifications (renames, column moves, priority changes, subtasks toggled, archive/restore).
* **Quick Task Actions**: One-click buttons to **Duplicate / Clone (`📋`)**, **Archive (`📦`)**, **Edit (`✏️`)**, or **Delete (`✕`)** cards.
* **Priority Levels**: `🔴 High`, `🟡 Medium`, `🔵 Low`, and `⚪ None`.
* **Due Date & Quick Presets**: Date picker with quick buttons (`Today`, `Tomorrow`, `+1 Week`, `Clear`).
* **Start & End Date/Time**: Precise `datetime-local` pickers with **Now** and **Clear** controls and live duration calculation.
* **Tags & Categories**: Tag chips with quick add/remove.
* **Subtasks & Progress**: Full checklist editor with completion statistics.

### 🔍 Search, Filters & Sorting
* **Live Search**: Real-time keyword search across task titles, descriptions, tags, and checklist items (`Ctrl + F`).
* **Priority Filters**: Filter by `All`, `🔴 High`, `🟡 Medium`, `🔵 Low`.
* **Status Filters**: Filter by `All`, `⚡ In Progress`, `✓ Done`, `⚠️ Overdue`.
* **Board Sorting**: Sort by `Manual Order`, `Due Date (Earliest)`, `Priority (High → Low)`, `Title (A-Z)`, or `Checklist % Done`.

### 🎨 13 Built-in Color Themes
Switch between 13 themes with high-contrast, theme-adapted green `+` (Add) and red `✕` (Delete) buttons:
* 🔮 **Midnight Purple** (Default)
* 🌑 **Classic Dark**
* 🌌 **Slate Blue**
* 🌲 **Forest Green**
* 🍷 **Crimson Red**
* ☕ **Coffee Mocha**
* 🌊 **Ocean Teal**
* 🌅 **Sunset Orange**
* ❄️ **Nordic Frost**
* 🧛 **Dracula**
* 🖥️ **3D Viewport Dark**
* ⚙️ **Game Engine Graphite**
* 📟 **Retro Console Boot**

### 🔔 System Tray & Desktop Integration
* **System Tray**: Minimize to tray, restore, and quick-add tasks from tray context menu.
* **Due Date Notifications**: Native system notifications alert you when tasks are due today or overdue upon launching.
* **Window Persistence**: Saves window dimensions, coordinates, and maximized state across sessions.

### 💾 Backup, Import & CSV Export
* **JSON Backup**: Export and restore complete multi-board backups via native file dialogs.
* **CSV Export**: Export all tasks with columns for Board, Column, Title, Priority, Status, Start Date/Time, End Date/Time, Duration, Due Date, Tags, and Checklist stats for Excel / Google Sheets.
* **Offline Storage**: Primary data saved to `todo_board_data.json` in user app data directory with automatic `localStorage` fallback.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | Quick Add Task to first column |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Focus Search Bar |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | Create New Board |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo Last Delete (5s window) |
| <kbd>Escape</kbd> | Close Modal / Clear Search |
| <kbd>?</kbd> | Open Keyboard Shortcuts Help |

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or newer recommended)
* npm (bundled with Node.js)

### Installation & Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/zViiX123/Todo_WebApp.git
   cd Todo_WebApp/TodoBoardDesktop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the desktop application:
   ```bash
   npm start
   ```

---

## 📦 Windows Installer & Executable Builds

### ☁️ Automated GitHub Builds & Releases (Recommended)
This repository includes an automated **GitHub Actions CI/CD workflow** (`.github/workflows/build-installer.yml`):
* **Automatic Releases**: Pushing a version tag (e.g. `v1.0.0`) automatically compiles and publishes a new **GitHub Release** with both the NSIS Setup Installer (`.exe`) and Portable standalone (`.exe`).
* **Workflow Artifacts**: Every commit to `main` builds and attaches the Windows binaries to the GitHub Actions run summary under **Artifacts** (`Todo-Board-Studio-Windows-Binaries`).
* **Manual Trigger**: Go to the **Actions** tab on GitHub, select **Build Windows Installer & Release**, and click **Run workflow**.

---

### 💻 Local Building & Packaging

To compile binaries locally on your machine:

1. **Build Both Installer & Portable Executable**:
   ```bash
   cd TodoBoardDesktop
   npm run build
   ```

2. **Build NSIS Setup Installer Only**:
   ```bash
   npm run build:installer
   ```

3. **Build Portable Executable Only**:
   ```bash
   npm run build:portable
   ```

The compiled binaries will be output to `TodoBoardDesktop/dist/`:
* **`Todo Board Studio Setup 1.0.0.exe`**: Full Windows installer with desktop & start menu shortcut support and clean uninstaller.
* **`Todo Board Studio 1.0.0.exe`**: Zero-install standalone portable executable.

---

## 📂 Project Structure

```text
Todo_WebApp/
├── .github/
│   └── workflows/
│       └── build-installer.yml  # Automated GitHub Actions Windows build & release pipeline
├── TodoBoardDesktop/
│   ├── index.html       # Single-page UI, components, modals & client logic
│   ├── main.js          # Electron main process (IPC, tray, window state, notifications)
│   ├── preload.js       # Secure contextBridge API bindings
│   ├── package.json     # App metadata, dependencies & build scripts
│   └── package-lock.json
├── .gitignore           # Git ignore rules for node_modules, build & cache files
├── LICENSE              # AGPL-3.0 License
└── README.md            # Comprehensive documentation & shortcuts guide
```

---

## 📜 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [LICENSE](LICENSE) file for details.
