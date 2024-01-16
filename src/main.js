
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');
const paths = require('./utils/paths');

const isDev = true;
let mainWindow;

// console.log("\n\n--------------------------------")
// console.log("Hello from Electron - main.js!!");
// console.log("App Path:", app.getAppPath());
// console.log("__dirname:", __dirname);
// console.log("cwd:", process.cwd());
// console.log("--------------------------------\n\n")

const webmConvertor = require('./backend/convertor');

const createWindow = () => {
    mainWindow = new BrowserWindow({
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


    // Redirect console.log / console.error to renderer process
    const originalLog = console.log;
    const originalError = console.error;

    console.log = function (...args) {
        // Call the original console.log
        originalLog.apply(console, args);

        // Send logs to the renderer process
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('console-message', { type: 'log', message: args.join(' ') })
        }
    }
    console.error = function (...args) {
        // Call the original console.log
        originalError.apply(console, args);

        // Send logs to the renderer process
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('console-message', { type: 'error', message: args.join(' ') })
        }
    }


    if (isDev) {
        mainWindow.webContents.openDevTools();
    }


    ipcMain.handle('get-path', async (event, pathType) => {
        console.log("Get path clicked!")
        try {
            const result = await showFolderSelectionDialog(mainWindow, pathType);
            return result;
        } catch (error) {
            console.error("Error")
        }
    })

    ipcMain.on('start-operation', (event, data) => {
        
        // // Redirect console.log / console.error to renderer process
        // const originalLog = console.log;
        // const originalError = console.error;

        // console.log = function (...args) {
        //     originalLog.apply(console, args);
        //     event.sender.send('console-message', { type: 'log', message: args.join(' ') })
        // }
        // console.error = function (...args) {
        //     originalError.apply(console, args);
        //     event.sender.send('console-message', { type: 'error', message: args.join(' ') })
        // }

        console.log("\nDATA RECEIVED: ", data, "\n");
        // console.log("\nEVENT RECEIVED: ", event, "\n");
        event.sender.send('op-started', "Conversion Started!");
        try {
            webmConvertor(data);
        } catch (error) {
            console.error(error)
        }
    })

    ipcMain.handle('ping', () => 'pong')

    mainWindow.setMinimumSize(500, 900);
    mainWindow.loadFile(paths.INDEX);
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



// // CONSOLE LOGS
// const originalLog = console.log
// const originalErr = console.error

// // Override console.log with a wrapper function
// console.log = function (...args) {
//     // Call the original console.log
//     process.stdout.write(...args);

//     // Send logs to the renderer process
//     if (mainWindow && mainWindow.webContents) {
//         mainWindow.webContents.send('console-message', { type: 'log', message: args.join(' ') })
//     }
// }
// // Override console.error with a wrapper function
// console.error = function (...args) {
//     // Call the original console.error
//     process.stdout.write(...args);

//     // Send logs to the renderer process
//     if (mainWindow && mainWindow.webContents) {
//         mainWindow.webContents.send('console-message', { type: 'error', message: args.join(' ') })
//     }
// }


