const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadData: () => ipcRenderer.invoke('load-data'),
    saveData: (data) => ipcRenderer.send('save-data', data),
    showNotification: (payload) => ipcRenderer.send('show-notification', payload),
    exportFileDialog: (payload) => ipcRenderer.invoke('export-file-dialog', payload),
    importFileDialog: (payload) => ipcRenderer.invoke('import-file-dialog', payload),
    pickAttachmentFile: () => ipcRenderer.invoke('pick-attachment-file'),
    openAttachmentPath: (filePath) => ipcRenderer.invoke('open-attachment-path', filePath),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    listBackups: () => ipcRenderer.invoke('list-backups'),
    restoreBackup: (filename) => ipcRenderer.invoke('restore-backup', filename),
    createInstantBackup: () => ipcRenderer.invoke('create-instant-backup'),
    openBackupsFolder: () => ipcRenderer.invoke('open-backups-folder'),
    onQuickTask: (callback) => {
        ipcRenderer.on('quick-add-task-trigger', () => callback());
    },
    onSpotlightCapture: (callback) => {
        ipcRenderer.on('spotlight-quick-capture', () => callback());
    }
});