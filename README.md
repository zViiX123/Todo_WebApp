# ✦ Todo Board Studio

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-purple.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version: 5.0.0](https://img.shields.io/badge/Version-5.0.0-brightgreen.svg)](https://github.com/zViiX123/Todo_WebApp/releases)
[![Web App](https://img.shields.io/badge/Live_Web_App-todoboard--studio.web.app-blue.svg)](https://todoboard-studio.web.app/)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Windows%20%7C%20macOS%20%7C%20PWA-orange.svg)]()

A sleek, fast, offline-first Kanban board and project management workspace with **Real-Time Cross-Platform Cloud Sync**, built for modern Web browsers, mobile PWA, and desktop Windows & macOS applications via **Electron**, **HTML5/CSS3**, and **Firebase Firestore**.

---

## 🌐 Live Web Application & Mobile PWA
* **Live App**: [https://todoboard-studio.web.app/](https://todoboard-studio.web.app/)
* **Installable PWA**: Install directly from Chrome, Edge, Safari, or mobile browsers as a standalone application.
* **Mobile Ready**: Built with dynamic `safe-area-inset` support for iOS notch/Dynamic Island and Android navigation bars.

---

## ✨ Features

### ☁️ Real-Time Cross-Platform Cloud Sync (AES-256-GCM Encrypted)
* **Zero-Knowledge Client-Side Encryption**: Every session is encrypted with **AES‑256‑GCM** before it leaves your device. Only your account has permission to your work. Cloud databases only store unintelligible encrypted ciphertext blobs.
* **Instant Sync**: Changes made on desktop instantly reflect on your phone and browser via Firebase Firestore.
* **Authentication**: Sign in securely with Google 1-Click OAuth or Email & Password.
* **Offline-First & Conflict-Free**: Continue working completely offline with `localStorage` caching; changes sync up automatically upon reconnecting with metadata in-flight validation.

### 🍅 Integrated Pomodoro Focus Mode
* **Focus Timer**: 25-minute focus intervals with automated 5-minute short breaks and 15-minute long breaks after 4 sessions.
* **Header & Floating HUD**: Live time display in header (`🍅 Focus 25:00`) and minimizable bottom-right widget.
* **Task Attachment**: Click **`🍅 Focus on Task`** in any Task Detail modal to anchor your timer session to that specific task.
* **Activity History & Sound**: Resonant singing bowl completion chime, celebratory confetti, and logged task history.

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

### 🎛️ Quick Filter Chips & Live Board Progress Meter *(New in v5.0)*
* **1-Click Triage Chips**: Filter active cards instantly by Status (`All`, `⚡ In Progress`, `✓ Done`, `⚠️ Overdue`, `📅 Today`, `☑ Subtasks`) and Priority (`🔴 High`, `🟡 Med`, `🔵 Low`).
* **Real-Time Board Progress Meter**: Visual completion bar in the toolbar tracking total tasks, finished tasks, and percentage (e.g., `14 / 20 Done • 70%`).

### ↕️ Interactive Subtask Drag-and-Drop Reordering *(New in v5.0)*
* **Dedicated Drag Handles**: Reorder custom subtasks inside the Task Detail modal using the grip handle (`⋮⋮`).
* **Protected Progress Milestones**: Default "Started" and "Finished" lifecycle subtasks are permanently safeguarded against deletion, editing, or reordering to preserve time-tracking integrity.

### ↩️ Multi-Action Undo/Redo Engine
* Revert task deletions, column deletions, task archives, subtask deletions, and color changes in 1 click.
* High-visibility non-blocking toast notification positioned above navigation bars.

### 🧠 Persistent Workspace Memory *(New in v5.0)*
* **Automatic Session Restoration**: The desktop and web apps remember your last opened board across launches and restore it automatically.
* **Multi-Workspace Management**: Create (<kbd>Ctrl</kbd> + <kbd>B</kbd>), Rename, Duplicate, or Delete workspaces with cloud persistence.
* **Instant Shortcuts**: Switch workspaces directly using <kbd>Ctrl</kbd> + <kbd>1</kbd> through <kbd>9</kbd>.

### 🛡️ 7-Day Rolling Vault Backups
* Automatic daily snapshots retained for up to 7 rolling days.
* 1-click manual instant backup creation and single-click restore with direct OS file explorer integration.

### 🎨 Custom Themes & Visual Styling
* Switch between high-contrast dark and light themes (Midnight, Cyberpunk, Monokai, Dracula, Light Mint, Pastel Lavender, Viewport, and more).
* Column color customization with full palette presets.

### 📎 File Attachments & Web Links
* Attach local documents and images or web URLs directly to tasks.
* Direct OS viewer integration for local desktop attachments.

### 🎉 Procedural Sound Synthesizer & Confetti
* **Zero-Asset Web Audio API Engine**: High-fidelity sound effects for clicks (`tick`), drag-and-drop (`pop`), completions (`complete` chime), fanfare arpeggios, and focus timer bells.
* **HTML5 Canvas Confetti**: Particle confetti bursts upon completing tasks or reaching 100% checklist progress.

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
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo Last Action |
| <kbd>Escape</kbd> | Close Modals / Clear Search |
| <kbd>?</kbd> | Open Keyboard Shortcuts Help |

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer recommended)
* npm (bundled with Node.js)

### Running Desktop App Locally
```bash
git clone https://github.com/zViiX123/Todo_WebApp.git
cd Todo_WebApp/TodoBoardDesktop
npm install
npm start
```

### Running Web App Locally
```bash
# Serve the web directory using any static HTTP server:
npx serve web
```

---

## 📦 Building Desktop Binaries
 
Compile setup installers locally:

```bash
# Windows (NSIS Installer & Portable):
npm run build

# macOS (DMG Installer & App ZIP):
npm run build:mac
```

The compiled binaries will be output to `TodoBoardDesktop/dist/`:
* **`Todo Board Studio Setup 5.0.0.exe`**: Windows setup installer.
* **`Todo Board Studio 5.0.0.exe`**: Zero-install Windows portable executable.
* **`Todo Board Studio-5.0.0.dmg`**: macOS DMG installer (Apple Silicon & Intel).
* **`Todo Board Studio-5.0.0-mac.zip`**: macOS compressed application bundle.

---

## 📂 Project Structure

```text
Todo_WebApp/
├── .github/                     # GitHub Actions CI/CD workflows
│   └── workflows/
│       └── build-installer.yml  # Automated release & multi-platform build pipeline
├── web/                         # Production Web & PWA App
│   ├── index.html               # Web app frontend UI and logic
│   ├── cloud-sync.js            # Firebase Firestore cloud sync manager
│   ├── sw.js                    # Service Worker caching for offline PWA
│   ├── manifest.json            # PWA Web App Manifest
│   └── icon.png                 # Application icons
├── TodoBoardDesktop/            # Electron Desktop Application
│   ├── index.html               # Desktop frontend UI
│   ├── cloud-sync.js            # Desktop cloud sync client
│   ├── main.js                  # Electron main process & loopback server
│   ├── preload.js               # Secure contextBridge API bindings
│   └── package.json             # Desktop app metadata & build scripts
├── package.json                 # Root build & scripts configuration
├── firebase.json                # Firebase hosting configuration
├── firestore.rules              # Firebase security rules
└── README.md                    # Documentation & user guide
```

---

## 📜 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [LICENSE](LICENSE) file for details.
