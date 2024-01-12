const path = require('node:path');
const { app } = require('electron');

const appPath = app.getAppPath();
const CURRENT_DIR = path.normalize(process.cwd());

// const FFMPEG_EXEC = path.join(__dirname, 'backend', 'exec', 'ffmpeg');
const FFMPEG_EXEC = path.join(appPath, 'src', 'backend', 'exec', 'ffmpeg');

// const INDEX = path.join(__dirname, 'renderer', 'index.html');
const INDEX = path.join(appPath, 'src','renderer', 'index.html');

// const PRELOADPATH = path.join(__dirname, 'preload.js');
const PRELOADPATH = path.join(appPath, 'src', 'preload.js');


module.exports = {
    FFMPEG_EXEC,
    CURRENT_DIR,
    INDEX,
    PRELOADPATH
}