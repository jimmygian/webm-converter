/** main.js
 * --------
 * - Serves as the main entry point for Electron application's main process.
 * - Responsible for:
 *   * managing the lifecycle of the application
 *   * Interacting with the operating system
 *   * Creating and managing browser windows
 *   * Executing Node.js modules
 * - Main purposes:
 *   * Initializes the Electron app by creating an instance of the 'app' module
 *   * Defines event listeners for the app's lifecycle ('ready', 'windows-all-closed', 'quit' etc..)
 *   * Send message (through preload.js) to renderer and receives messages from it.
 */

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');
const paths = require('./utils/paths');
const fs = require('fs');
const webmConvertor = require('./backend/convertor');

// IS DEV
const isDev = true;
let mainWindow;

// // For debugging purposes
// console.log("\n\n--------------------------------")
// console.log("Hello from Electron - main.js!!");
// console.log("App Path:", app.getAppPath());
// console.log("__dirname:", __dirname);
// console.log("cwd:", process.cwd());
// console.log("--------------------------------\n\n")


// MAIN WINDOW CREATION
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

  // REDIRECT CONSOLE LOGS TO RENDERER

  /* Creates copies of the original console functions */
  const originalLog = console.log;
  const originalError = console.error;

  /* The following 2 functions the console.log /console.error functions 
     with our own function that mimic the usage of console.log, 
     but redirects the message where we want it to go */

  console.log = function (...args) {
    // Calls the original console.log so that the message is also output to the original console (terminal in our case)
    originalLog.apply(console, args);
    // Send logs to the renderer process
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('console-message', { type: 'log', message: args.join(' ') })
    }
  }

  console.error = function (...args) {
    originalError.apply(console, args);
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('console-message', { type: 'error', message: args.join(' ') })
    }
  }


  if (isDev) {
    mainWindow.webContents.openDevTools();
  }


  // HANDLERS (that connect main with renderer through preload.js)

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

    // Log info to renderer for debugging purposes
    console.log("PATHS FFMPEG EXEC:", paths.FFMPEG_EXEC)
    console.log("PATHS PRELOAD:", paths.PRELOADPATH)
    console.log("app.getAppPath() main.js:", app.getAppPath())
    console.log("app.getAppPath() paths.js:", paths.appPath)

    fs.access(paths.FFMPEG_EXEC, fs.constants.X_OK, (err) => {
      console.log('ffmpegPath has execute permission:', !err)
    });

    // Send 'op-started' signal to renderer
    event.sender.send('op-started', "Conversion Started!");

    // Try to convert
    try {
      webmConvertor(data);
    } catch (error) {
      console.error(error)
    }
  })

  mainWindow.setMinimumSize(500, 900);
  mainWindow.loadFile(paths.INDEX);
}


// 'app'-specific operations (Electron)
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
async function showFolderSelectionDialog(window, path = 'openDirectory') {
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