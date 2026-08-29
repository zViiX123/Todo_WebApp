const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog, Notification, shell } = require('electron');
const path = require('path');
const fs = require('fs');

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

// Create a simple tray icon if asset not present
function createTrayIcon() {
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

    mainWindow = new BrowserWindow({
        width: state.width || 1360,
        height: state.height || 800,
        x: state.x,
        y: state.y,
        minWidth: 800,
        minHeight: 500,
        autoHideMenuBar: true,
        backgroundColor: '#241735',
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
        if (url.startsWith('https://') || url.startsWith('http://')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        try {
            const parsedUrl = new URL(navigationUrl);
            if (parsedUrl.protocol === 'file:') return;
        } catch (e) {}
        event.preventDefault();
        if (navigationUrl.startsWith('https://') || navigationUrl.startsWith('http://')) {
            shell.openExternal(navigationUrl);
        }
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

app.whenReady().then(() => {
    createWindow();
    setupTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
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