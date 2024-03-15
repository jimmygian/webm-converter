/** I/O FUNCTIONS
 * Helper functions that let program
 * access computer I/O and get
 * user-imported information about paths.
 * 
 * It's imported in convertor.js
 * */

// MODULES
const { ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');

// CONSTANTS
const { FFMPEG_WEBM_VIDEO_EXTENSIONS } = require('./constants.js')



/** ==== EXPORTED FUNCTION ====
 * Returns an arr of object(s) that contain path Info for all path's files 
 * */
function createPathInfoArr(userPath) {
  const arr = [];

  // Gets statistics from file path using fs.statSync([path])
  const stats = fs.statSync(userPath);

  if (stats.isFile()) {
    // Handle File Path
    const obj = getPathInfo(userPath);
    if (obj !== null) {
      arr.push(obj);
    }
    console.log("createPathInfoArr(file) returned:", arr)
    return arr;
  } else {
    // Handle Dir Path
    const files = fs.readdirSync(userPath);
    files.forEach(fileName => {
      const obj = getPathInfo(userPath, fileName);
      if (obj !== null) {
        arr.push(obj);
      }
    })
    console.log("createPathInfoArr(userPath) returned:", arr)

    if (arr.length > 0) {
      return arr;
    } else {
      throw new Error(`On 'convertor.js' -> createPathInfoArr(): Array does not contain any valid file paths`)
    }
  }
}



// Helper //

// Accepts 1 absolute path - returns an object of path related info
function getPathInfo(userPath, fileName = null) {

  // Nested function - constructs object that contains path info
  function createObj(inputPath) {

    // Check if path is absolute
    const absolutePath = path.resolve(inputPath);

    const dir = path.dirname(absolutePath);
    const filename = path.basename(absolutePath);

    const ext = path.extname(absolutePath);
    if (!FFMPEG_WEBM_VIDEO_EXTENSIONS.includes(ext.toLowerCase())) {
      return null;
    }

    const filenameNoExt = path.basename(absolutePath, ext);

    const fileInfo = {
      absolutePath,
      dir,
      filename,
      filenameNoExt,
      ext,
    };

    return fileInfo;
  }

  // Main function, has to pass file path to createObj()
  let pathInfo;
  if (fileName !== null) {
    pathInfo = createObj(path.join(userPath, fileName));
  } else {
    pathInfo = createObj(userPath);
  }
  return pathInfo;
}



module.exports = {
  createPathInfoArr,
}