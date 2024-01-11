console.log("Hello from Electron!!");

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');

const INDEX = path.join(__dirname, 'renderer', 'index.html');
const PRELOADPATH = path.join(__dirname, 'preload.js');
const isDev = true;

const webmConvertor = require('./backend/convertor');

const createWindow = () => {
    const win = new BrowserWindow({
        // Basic Configurations
        title: 'Main Window',
        width: isDev ? 1000 : 580,
        height: 830,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: PRELOADPATH
        }
    });

    if (isDev) {
        win.webContents.openDevTools();
    }

    ipcMain.handle('get-path', async (event, pathType) => {
        console.log("Get path clicked!")
        try {
            const result = await showFolderSelectionDialog(win, pathType);
            console.log(result)
            webmConvertor(result.path)
            return result;
        } catch (error) {
            console.error("Error")
        }
    })

    ipcMain.handle('ping', () => 'pong')

    win.setMinimumSize(500, 900);
    win.loadFile(INDEX);
}



app.whenReady().then(() => {
    createWindow()
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})



// Helper functions

/**
 * Show a folder selection dialog to the user 
 * 
 * @param {BrowserWindow} window - The BrowserWindow object for dialog positioning.
 * @param {string} [path='openDirectory'] - The path type: 'openFile' or 'openDirectory'.
 * @returns {Promise<{selected: true, path: string}>} - Object indicating selected or canceled.
 *  
 */
async function showFolderSelectionDialog(window, path='openDirectory') {
    try {
        const properties = path === 'openFile' ? ['openFile'] : ['openDirectory'];
    
        const userPath = await dialog.showOpenDialog(window, {
            properties: properties,
        });
    
        if (!userPath.canceled) {
            const selectedPath = userPath.filePaths[0];
            console.log("Selected Path:", selectedPath);
            return { selected: true, path: selectedPath };
        } else {
            console.log("Path selection cancelled.");
            return { canceled: true };
        }
    } catch (error) {
        console.log("Error in showFolderSelectionDialog()")
    }
}