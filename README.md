# ✦ Todo Board Studio (Desktop)

A sleek, offline-first Kanban board & project management desktop application built with **Electron**, modern **HTML5/CSS3**, and **JavaScript**.

Organize tasks across multiple boards, track time automatically with checklist-driven timers, categorize with tags, set due dates, customize themes, and export/backup your data locally.

---

## ✨ Features

### 🍅 Integrated Pomodoro Focus Mode
* **Focus Timer**: Work in 25-minute focus intervals with automatic 5-minute short breaks and 15-minute long breaks after 4 sessions.
* **Header & Floating HUD**: Live time display in header (`🍅 Focus 25:00`) and a floating minimizable widget at the bottom-right of the screen.
* **Task Attachment**: Click **`🍅 Focus on Task`** in any Task Detail modal to anchor your session to that task.
* **Activity Logging & Sounds**: Plays a resonant singing bowl chime on completion, triggers celebration confetti, and logs the session to the task's activity history.

### ⚡ Global Quick-Capture HUD (Spotlight-Style)
* **Spotlight Modal**: Press <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> from anywhere to summon a floating quick-add prompt.
* **Smart Shorthand Parsing**: Live badges parse while typing:
  * `!high` / `!med` / `!low` / `!urgent` — Priority
  * `@today` / `@tomorrow` / `@yesterday` / `@+3d` / `@YYYY-MM-DD` / `@monday` — Due date
  * `#tag1 #tag2` — Tags & categories
  * `^ColumnName` — Target column
* Press <kbd>Enter</kbd> to immediately create the task with audio feedback.

### 📅 Interactive Calendar & 📈 Chronological Timeline Views
* **Toolbar View Switcher**: Effortlessly toggle between **`⊞ Board`**, **`📅 Calendar`**, and **`📈 Timeline`**.
* **Monthly Calendar Grid**: Navigate months (`‹`, `›`, `Today`), view color-coded task pills on their due dates, and click any day's `+` to add tasks.
* **Drag-and-Drop Rescheduling**: Drag any task pill onto another day cell to reschedule its due date instantly!
* **Gantt-Lite Timeline**: Visual horizontal bars plotting task durations and progress grouped by column stages.

### 📁 Enhanced Workspace & Multi-Board Switcher
* **Modern Workspace Menu**: Elevated dropdown showing active workspace title, folder icon, and active task progress counts.
* **Fast Switching & Duplication**: 1-click duplication of boards, quick rename, delete, and instant navigation via <kbd>Ctrl</kbd> + <kbd>1</kbd> .. <kbd>9</kbd>.

### 📎 Local File & Web Link Attachments
* **Local Documents & Images**: Attach files from your computer via native file dialogs or drag-and-drop directly into the Task Modal.
* **Web Link Cards**: Add URL links with 1-click browser opening.
* **Direct OS Opening**: Click `↗` to open local attached files or images directly in your operating system's default viewer.

### 🎉 Micro-Celebrations & Procedural Sound Synthesizer
* **Zero-Asset Web Audio API Engine**: High-fidelity sound effects for clicks (`tick`), drag-and-drop (`pop`), completions (`complete` two-tone chime), fanfare arpeggios, and focus timer bells.
* **HTML5 Canvas Confetti**: Particle confetti burst upon completing tasks or reaching 100% checklist progress.
* **Sound Toggle**: Quick toggle button (`🔊 / 🔇`) in the header.

### 🔄 1-Click In-App Update Checker
* Click **🔄 Updates** in the header to check GitHub Releases in real-time.
* Displays release notes, version comparisons, and direct download links.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> | Spotlight Global Quick-Capture HUD |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Toggle Pomodoro Focus Timer |
| <kbd>Ctrl</kbd> + <kbd>1</kbd> .. <kbd>9</kbd> | Switch Workspace (1 to 9) |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | Quick Add Task to first column |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Focus Search Bar |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | Create New Workspace |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo Last Delete (5s window) |
| <kbd>Escape</kbd> | Close Modals / Clear Search |
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
