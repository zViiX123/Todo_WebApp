const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dataPath = path.join(app.getPath('userData'), 'todo_board_data.json');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        autoHideMenuBar: true, // Hides the default Windows menu bar
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Listen for save/load requests from your HTML file
ipcMain.handle('load-data', () => {
    if (fs.existsSync(dataPath)) {
        return fs.readFileSync(dataPath, 'utf-8');
    }
    return null;
});

ipcMain.on('save-data', (event, jsonData) => {
    fs.writeFileSync(dataPath, jsonData, 'utf-8');
});