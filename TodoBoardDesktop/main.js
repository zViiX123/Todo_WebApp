const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog, Notification, shell, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

const userDataPath = app.getPath('userData');
const dataPath = path.join(userDataPath, 'todo_board_data.json');
const windowStatePath = path.join(userDataPath, 'window_state.json');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Helper to load window state
function loadWindowState() {
    try {
        if (fs.existsSync(windowStatePath)) {
            const raw = fs.readFileSync(windowStatePath, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Failed to load window state:', e);
    }
    return { width: 1360, height: 800, isMaximized: false };
}

// Helper to save window state
function saveWindowState() {
    if (!mainWindow) return;
    try {
        const isMaximized = mainWindow.isMaximized();
        let bounds = isMaximized ? null : mainWindow.getBounds();
        const state = {
            isMaximized,
            ...(bounds || { width: 1360, height: 800 })
        };
        fs.writeFileSync(windowStatePath, JSON.stringify(state), 'utf-8');
    } catch (e) {
        console.error('Failed to save window state:', e);
    }
}

// Create a tray icon from custom asset or fallback
function createTrayIcon() {
    const iconPngPath = path.join(__dirname, 'icon.png');
    if (fs.existsSync(iconPngPath)) {
        return nativeImage.createFromPath(iconPngPath).resize({ width: 16, height: 16 });
    }

    // 16x16 standard tray icon (purple/white themed dot pattern)
    const size = 16;
    const canvasBuffer = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const idx = (y * size + x) * 4;
            const isBorder = (x >= 2 && x <= 13 && (y === 2 || y === 13)) || (y >= 2 && y <= 13 && (x === 2 || x === 13));
            const isCheckmark = (x >= 5 && x <= 7 && y === 9) || (x >= 7 && x <= 11 && y === 11 - (x - 7));
            if (isCheckmark) {
                canvasBuffer[idx] = 127;     // R
                canvasBuffer[idx + 1] = 203; // G
                canvasBuffer[idx + 2] = 142; // B
                canvasBuffer[idx + 3] = 255; // A
            } else if (isBorder || (x > 2 && x < 13 && y > 2 && y < 13)) {
                canvasBuffer[idx] = 91;      // R
                canvasBuffer[idx + 1] = 67;  // G
                canvasBuffer[idx + 2] = 134; // B
                canvasBuffer[idx + 3] = 255; // A
            } else {
                canvasBuffer[idx + 3] = 0;   // Transparent
            }
        }
    }
    return nativeImage.createFromBuffer(canvasBuffer, { width: size, height: size });
}

function createWindow() {
    const state = loadWindowState();
    const iconPath = path.join(__dirname, 'icon.png');

    mainWindow = new BrowserWindow({
        width: state.width || 1360,
        height: state.height || 800,
        x: state.x,
        y: state.y,
        minWidth: 800,
        minHeight: 500,
        autoHideMenuBar: true,
        backgroundColor: '#241735',
        icon: fs.existsSync(iconPath) ? iconPath : undefined,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    if (state.isMaximized) {
        mainWindow.maximize();
    }

    mainWindow.loadFile('index.html');

    // Securely handle external links (e.g. from Markdown descriptions) in default system browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        try {
            const parsed = new URL(url);
            if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
                shell.openExternal(url);
            }
        } catch (e) {}
        return { action: 'deny' };
    });

    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        try {
            const parsedUrl = new URL(navigationUrl);
            if (parsedUrl.protocol === 'file:') return;
        } catch (e) {}
        event.preventDefault();
        try {
            const parsed = new URL(navigationUrl);
            if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
                shell.openExternal(navigationUrl);
            }
        } catch (e) {}
    });

    mainWindow.on('close', (event) => {
        saveWindowState();
    });

    mainWindow.on('resize', saveWindowState);
    mainWindow.on('move', saveWindowState);
}

function setupTray() {
    try {
        const icon = createTrayIcon();
        tray = new Tray(icon);
        tray.setToolTip('Todo Board Studio');

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show Todo Board',
                click: () => {
                    if (mainWindow) {
                        if (mainWindow.isMinimized()) mainWindow.restore();
                        mainWindow.show();
                        mainWindow.focus();
                    }
                }
            },
            {
                label: 'Quick Add Task',
                click: () => {
                    if (mainWindow) {
                        if (mainWindow.isMinimized()) mainWindow.restore();
                        mainWindow.show();
                        mainWindow.focus();
                        mainWindow.webContents.send('quick-add-task-trigger');
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => {
                    isQuitting = true;
                    app.quit();
                }
            }
        ]);

        tray.setContextMenu(contextMenu);
        tray.on('double-click', () => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.focus();
            }
        });
    } catch (e) {
        console.error('Tray initialization error:', e);
    }
}

function setupGlobalShortcuts() {
    try {
        globalShortcut.register('CommandOrControl+Shift+Space', () => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.focus();
                mainWindow.webContents.send('spotlight-quick-capture');
            }
        });
    } catch (e) {
        console.error('Failed to register global shortcut:', e);
    }
}

app.whenReady().then(() => {
    createWindow();
    setupTray();
    setupGlobalShortcuts();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('will-quit', () => {
    try {
        globalShortcut.unregisterAll();
    } catch (e) {}
});

app.on('before-quit', () => {
    isQuitting = true;
    saveWindowState();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- IPC Handlers ---

// Load data
ipcMain.handle('load-data', () => {
    try {
        if (fs.existsSync(dataPath)) {
            return fs.readFileSync(dataPath, 'utf-8');
        }
    } catch (err) {
        console.error('Error loading data:', err);
    }
    return null;
});

// Save data
ipcMain.on('save-data', (event, jsonData) => {
    try {
        fs.writeFileSync(dataPath, jsonData, 'utf-8');
    } catch (err) {
        console.error('Error saving data:', err);
    }
});

// Native Notification
ipcMain.on('show-notification', (event, { title, body }) => {
    if (Notification.isSupported()) {
        const notif = new Notification({
            title: title || 'Todo Board Studio',
            body: body || '',
            icon: createTrayIcon()
        });
        notif.show();
        notif.on('click', () => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.focus();
            }
        });
    }
});

// Native Save File Dialog (for JSON / CSV export)
ipcMain.handle('export-file-dialog', async (event, { defaultName, content, filters }) => {
    if (!mainWindow) return { success: false, cancelled: true };
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Board Data',
        defaultPath: defaultName || 'todo_board_export.json',
        filters: filters || [{ name: 'All Files', extensions: ['*'] }]
    });

    if (canceled || !filePath) {
        return { success: false, cancelled: true };
    }

    try {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true, filePath };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Native Open File Dialog (for JSON import)
ipcMain.handle('import-file-dialog', async (event, { filters }) => {
    if (!mainWindow) return { success: false, cancelled: true };
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Board Data',
        properties: ['openFile'],
        filters: filters || [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (canceled || !filePaths || filePaths.length === 0) {
        return { success: false, cancelled: true };
    }

    try {
        const content = fs.readFileSync(filePaths[0], 'utf-8');
        return { success: true, content, filePath: filePaths[0] };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Native File Picker for Task Attachments
ipcMain.handle('pick-attachment-file', async () => {
    if (!mainWindow) return { success: false, cancelled: true };
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Attach File to Task',
        properties: ['openFile']
    });

    if (canceled || !filePaths || filePaths.length === 0) {
        return { success: false, cancelled: true };
    }

    try {
        const filePath = filePaths[0];
        const fileName = path.basename(filePath);
        let fileSize = 0;
        try {
            const stat = fs.statSync(filePath);
            fileSize = stat.size;
        } catch (e) {}
        const ext = path.extname(filePath).toLowerCase();
        const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'].includes(ext);
        return { success: true, filePath, fileName, fileSize, isImage, ext };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Block dangerous executable and script extensions on Windows
const DANGEROUS_EXTENSIONS = new Set([
    '.exe', '.bat', '.cmd', '.ps1', '.ps1xml', '.ps2', '.psc1', '.psc2',
    '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh', '.scr', '.msi', '.msp',
    '.com', '.hta', '.cpl', '.reg', '.jar', '.pif', '.gadget', '.inf',
    '.ins', '.isp', '.lnk', '.dll', '.sys', '.drv', '.ocx', '.bin'
]);

// Open File in OS Default Application (Protected against Executable Execution)
ipcMain.handle('open-attachment-path', async (event, filePath) => {
    if (!filePath || typeof filePath !== 'string') return { success: false, error: 'Invalid path' };

    // Normalize and clean path
    const normalizedPath = path.normalize(filePath);

    // Disallow UNC network share paths or remote pipes (e.g. \\evil.com\payload)
    if (normalizedPath.startsWith('\\\\') || normalizedPath.startsWith('//')) {
        return { success: false, error: 'Remote network paths are not allowed for security reasons.' };
    }

    // Check file extension safety
    const ext = path.extname(normalizedPath).toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(ext)) {
        return { success: false, error: `Executable or script files (${ext}) cannot be opened directly for security.` };
    }

    // Ensure file exists locally
    if (!fs.existsSync(normalizedPath)) {
        return { success: false, error: 'File does not exist on this machine.' };
    }

    try {
        const result = await shell.openPath(normalizedPath);
        return { success: !result, error: result || null };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Check for App Updates via GitHub Releases API (Secure, Sandboxed, and Validated)
ipcMain.handle('check-for-updates', async () => {
    let currentVersion = '1.0.3';
    try {
        const currentPkg = require('./package.json');
        if (currentPkg && currentPkg.version) currentVersion = currentPkg.version;
    } catch (e) {}

    return new Promise((resolve) => {
        const options = {
            hostname: 'api.github.com',
            path: '/repos/zViiX123/Todo_WebApp/releases/latest',
            headers: {
                'User-Agent': 'TodoBoardStudio-DesktopApp',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const MAX_BODY_SIZE = 1024 * 1024; // 1MB maximum response limit
        let totalBytes = 0;

        const req = https.get(options, (res) => {
            if (res.statusCode !== 200) {
                res.resume(); // Free memory
                return resolve({
                    success: false,
                    currentVersion,
                    error: `GitHub API returned HTTP ${res.statusCode}`
                });
            }

            let rawData = '';
            res.on('data', (chunk) => {
                totalBytes += chunk.length;
                if (totalBytes > MAX_BODY_SIZE) {
                    req.destroy();
                    return resolve({
                        success: false,
                        currentVersion,
                        error: 'Response payload exceeded security threshold (1MB).'
                    });
                }
                rawData += chunk;
            });

            res.on('end', () => {
                try {
                    const release = JSON.parse(rawData);
                    const rawTag = typeof release.tag_name === 'string' ? release.tag_name.trim() : '';

                    // Validate tag format matches semantic versioning (e.g. v1.0.0 or 1.0.0)
                    if (!/^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(rawTag)) {
                        return resolve({
                            success: false,
                            currentVersion,
                            error: 'Invalid release version format received from server.'
                        });
                    }

                    const latestVersion = rawTag.replace(/^v/, '');
                    const isUpdateAvailable = compareSemver(latestVersion, currentVersion) > 0;

                    // Ensure releaseUrl strictly points to official repository releases page
                    let safeReleaseUrl = 'https://github.com/zViiX123/Todo_WebApp/releases';
                    if (typeof release.html_url === 'string' && release.html_url.startsWith('https://github.com/zViiX123/Todo_WebApp/releases')) {
                        safeReleaseUrl = release.html_url;
                    }

                    resolve({
                        success: true,
                        currentVersion,
                        latestVersion: latestVersion || currentVersion,
                        isUpdateAvailable,
                        releaseName: String(release.name || rawTag || 'Latest Release').slice(0, 100),
                        releaseNotes: String(release.body || 'No release notes provided.').slice(0, 10000),
                        releaseUrl: safeReleaseUrl,
                        publishedAt: release.published_at
                    });
                } catch (e) {
                    resolve({ success: false, currentVersion, error: 'Failed to parse update release data.' });
                }
            });
        });

        req.on('error', (err) => {
            resolve({ success: false, currentVersion, error: err.message });
        });

        req.setTimeout(8000, () => {
            req.destroy();
            resolve({ success: false, currentVersion, error: 'Update check timed out.' });
        });
    });
});

function compareSemver(v1, v2) {
    if (!v1 || !v2) return 0;
    const p1 = v1.split('.').map(n => parseInt(n) || 0);
    const p2 = v2.split('.').map(n => parseInt(n) || 0);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const num1 = p1[i] || 0;
        const num2 = p2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
}