const { contextBridge, ipcRenderer } = require('electron');

// Import necessary modules, functions, and objects you need to expose to renderer.js
const os = require('os');
const path = require('node:path');
const fs = require('fs');

// Expose 'versions' to the renderer process
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
})

// Expose 'path' module functions and add 'cwd' preperty to the renderer process
contextBridge.exposeInMainWorld('path', {
    join: (...args) => path.join(...args),
    relative: (abPath, target) => path.relative(abPath, target),
    dirname: (abPath) => path.dirname(abPath),
    basename: (abPath) => path.normalize(abPath),
    sep: (abPath) => abPath.split(path.sep),
    cwd: process.cwd() // Expose current working dir
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    ping: () => ipcRenderer.invoke('ping'),
    getDir: () => ipcRenderer.invoke('get-path', 'openDirectory'),
    getFile: () => ipcRenderer.invoke('get-path', 'openFile'),
    startOperation: (data) => ipcRenderer.send('start-operation', data)
});