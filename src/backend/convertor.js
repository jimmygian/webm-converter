// const { exec } = require('child_process');
const { spawn } = require('node:child_process');
const { promisify } = require('util');
const spawnPromise = promisify(spawn);
// const execPromise = promisify(exec);
const fs = require('fs');
const path = require('path');
const { app, ipcMain } = require('electron');

const paths = require('../utils/paths.js')

// Constants
const NEW_FILE_EXT = '.webm';
const VIDEO_EXTENSIONS = [
    '.mp4',
    '.mov',
    '.mkv',
    '.wmv',
    '.avi',
    '.wav',
    '.mp3'
];


// ===== MAIN FUNCTION ===== //

function webmConvertor({ input, output, isFolder }) {
    console.log("BELOW")
    console.log(paths)
    console.log("getAppPath from convertor.js:", app.getAppPath())
    const inputArr = createPathInfoArr(input);

    let outputPath = output;
    if (!output) {
        outputPath = path.join(inputArr[0].dir, 'output');
        fs.mkdirSync(outputPath, { recursive: true });
    }

    console.log("PATHS from convertor.js:", paths)
    console.log("\n\n\n===================")
    console.log("CONVERSION BEGUN\n")
    console.log("----------------")

    for (let pathInfo of inputArr) {
        executeFfmpegCmd(pathInfo, outputPath)
    }

    console.log("\nCONVERSION FINISHED")
    console.log("===================\n\n\n")
}


// WITH SPAWN

function executeFfmpegCmd(pathInfo, outputPath) {
    console.log(`Running conversion for: '${pathInfo.filename}' . .`);
    
    // Store Command exec
    const ffmpegCmd = paths.FFMPEG_EXEC;
    // const ffmpegCmd = "ffmpeg"    

    // Store arguments
    const args = [];
    args.push(`-i`);
    args.push(`${pathInfo.absolutePath}`);
    // args.push(`-deadline`, `best`); /* good, best, realtime */ 
    args.push(`-c:v`, `libvpx-vp9`); // Uses VP9 as a video codec 
    args.push(`-c:a`, `libopus`); // Uses OPUS for audio codec */
    args.push(`-y`); /* Overwrites existing files without causing ffmpeg to crush */
    
    const outputFilename = `${pathInfo.filenameNoExt}.webm`;
    const absOutputPath = path.join(outputPath, outputFilename);
    args.push(absOutputPath);

    // Run command
    const ffmpegProcess = spawn(ffmpegCmd, args);
    // const ffmpegProcess = spawn(ffmpegCmd, args, { stdio: 'inherit'});
    // console.log(spawn(ffmpegCmd, args));
    // console.log(ffmpegCmd, args)

    // Log data
    ffmpegProcess.stdout.on('data', (data) => {
        console.log(`  >> File converted.`);
        console.log(`ffmpeg stdout: ${data}`)
    })
    ffmpegProcess.stderr.on('data', (data) => {
        console.error(`ffmpeg stderr: ${data}`)
    })
    ffmpegProcess.on('close', (code) => {
        console.log(`ffmpeg process exited with code ${code}`)
    })
}


// ========================= //


// I/O FUNCTIONS

// Creates an arr of objects that contain path Info for all path's files
function createPathInfoArr(userPath) {
    const arr = [];
    
    try {
        const stats = fs.statSync(userPath);
       
        if (stats.isFile()) {
            // Handle File Path
            const obj = getPathInfo(userPath);
            arr.push(obj);
            // console.log("createPathInfoArr(file) returned:", arr)
            return arr;
        } else {
            // Handle Dir Path
            const files = fs.readdirSync(userPath);
            files.forEach(fileName => {
                const obj = getPathInfo(userPath, fileName);
                arr.push(obj);
            })
            // console.log("createPathInfoArr(userPath) returned:", arr)
            return arr;
        }
        
    } catch (error) {
        ipcMain.handle('get-message', () => error);
        throw new Error(`On 'convertor.js' -> createPathInfoArr(): Failed to get directory stats for path '${userPath}'`, error)
    }
}

// Accepts 1 absolute path - returns an object of path related info
function getPathInfo(userPath, fileName=null) {
    
    // Nested function - constructs object that contains path info
    function createObj(inputPath) {
        // Check if path is absolute
        const absolutePath = path.resolve(inputPath);
        
        const dir = path.dirname(absolutePath);
        const filename = path.basename(absolutePath);
        const ext = path.extname(absolutePath);
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


module.exports = webmConvertor;