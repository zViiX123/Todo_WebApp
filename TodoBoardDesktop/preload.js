const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadData: () => ipcRenderer.invoke('load-data'),
    saveData: (data) => ipcRenderer.send('save-data', data),
    showNotification: (payload) => ipcRenderer.send('show-notification', payload),
    exportFileDialog: (payload) => ipcRenderer.invoke('export-file-dialog', payload),
    importFileDialog: (payload) => ipcRenderer.invoke('import-file-dialog', payload),
    onQuickTask: (callback) => {
        ipcRenderer.on('quick-add-task-trigger', () => callback());
    }
});