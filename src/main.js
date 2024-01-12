
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');
const paths = require('./utils/paths');


console.log("\n\n--------------------------------")
console.log("Hello from Electron - main.js!!");
console.log("App Path:", app.getAppPath());
console.log("__dirname:", __dirname);
console.log("cwd:", process.cwd());
console.log("--------------------------------\n\n")



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
            preload: paths.PRELOADPATH
        }
    });

    if (isDev) {
        win.webContents.openDevTools();
    }

    ipcMain.handle('get-path', async (event, pathType) => {
        console.log("Get path clicked!")
        try {
            const result = await showFolderSelectionDialog(win, pathType);
            return result;
        } catch (error) {
            console.error("Error")
        }
    })

    ipcMain.on('start-operation', (event, data) => {
        console.log("\nDATA RECEIVED: ", data, "\n");
        // console.log("\nEVENT RECEIVED: ", event, "\n");
        webmConvertor(data);
    })

    ipcMain.handle('ping', () => 'pong')

    win.setMinimumSize(500, 900);
    win.loadFile(paths.INDEX);
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