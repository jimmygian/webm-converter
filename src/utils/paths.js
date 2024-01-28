/** paths.js
 * Stores the paths that will be used
 * to route the all files together
 * NOTE: when packaging app, routing may change.
 * In this file, logic will be applied to determine
 * different routing for packaging, but additional
 * routing settings may need to be configured in package.json
 */


// // Logs for debugging
// console.log("Hi from paths.js")

const path = require('node:path');
const { app } = require('electron');

const appPath = app.getAppPath();
const CURRENT_DIR = path.normalize(process.cwd());

const platform = process.platform;

let ffmpeg = '';
let folder = '';

if (platform === 'win32') {
    console.log('Windows');
    ffmpeg = 'ffmpeg.exe'
    folder = 'win'
} else if (platform === 'darwin') {
    console.log('Mac OS');
    ffmpeg = 'ffmpeg'
    folder = 'mac'
} else if (platform === 'linux') {
    console.log('Linux');
    ffmpeg = 'ffmpeg'
    folder = 'linux'
} else {
    console.log('Unknown OS');
    ffmpeg = 'ffmpeg'
    folder = 'unknown'
}

let FFMPEG_EXEC;
if (app.isPackaged) {
    FFMPEG_EXEC = path.join(appPath, '..', '..', ffmpeg);
} else {
    // const FFMPEG_EXEC = path.join(__dirname, '..', 'backend', 'exec', 'ffmpeg');
    FFMPEG_EXEC = path.join(appPath, 'src', 'backend', 'exec', folder, ffmpeg);
}

// const INDEX = path.join(__dirname, '..', 'renderer', 'index.html');
const INDEX = path.join(appPath, 'src','renderer', 'index.html');

// const PRELOADPATH = path.join(__dirname, '..', 'preload.js');
const PRELOADPATH = path.join(appPath, 'src', 'preload.js');


module.exports = {
    FFMPEG_EXEC,
    CURRENT_DIR,
    INDEX,
    PRELOADPATH,
    appPath
}

// "target": ["dmg", "zip", "7z", "pkg"]