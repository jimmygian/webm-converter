/** Convertor.js: Backend logic
 * This is plain JS logic that automates
 * and then calls the FFMPEG exec to
 * convert files.
 */

const { spawn, ChildProcess } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const { app, ipcMain } = require('electron');

const paths = require('../utils/paths.js');
const IO = require('./IO.js');

// Constants
let ffmpegProcess = null;

// ===== MAIN FUNCTION ===== //

async function webmConvertor({ input, output, isFolder }) {
    const inputArr = IO.createPathInfoArr(input);

    let outputPath = output;
    if (!output) {
        outputPath = path.join(inputArr[0].dir, 'output');
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // LOGS 'Conversion started' message to the UI
    console.log("\n\n\n===================")
    console.log("CONVERSION BEGUN\n")
    console.log("----------------")

    for (let pathInfo of inputArr) {
        try {
            await executeFfmpegCmd(pathInfo, outputPath);
        } catch (error) {
            console.Error(error);
        }
    }

    console.log("\nCONVERSION FINISHED")
    console.log("===================\n\n\n")
}

// ========================= //



// FFMPEG COMMAND FUNCTION
async function executeFfmpegCmd(pathInfo, outputPath) {
    console.log(`Running conversion for: '${pathInfo.filename}' . .`);
    
    // Store Command exec
    const ffmpegCmd = paths.FFMPEG_EXEC;
    // const ffmpegCmd = "ffmpeg"    

    // Store arguments
    const args = [];
    args.push(`-i`);
    args.push(`${pathInfo.absolutePath}`);
    // args.push(`-deadline`, `best`);     /* good, best, realtime */ 
    args.push(`-c:v`, `libvpx-vp9`);    /* Uses VP9 as a video codec */
    args.push(`-c:a`, `libopus`);       /* Uses OPUS for audio codec */
    args.push(`-y`);                    /* Overwrites existing files without causing ffmpeg to crush */
    
    // Create and store output name
    const outputFilename = `${pathInfo.filenameNoExt}.webm`;
    const absOutputPath = path.join(outputPath, outputFilename);
    args.push(absOutputPath);

    // Run command
    ffmpegProcess = spawn(ffmpegCmd, args);

    // Creates a promise function to run Process, so that FFMPEG commands are executed 
    // sequencially and not all together
    const spawnPromise = new Promise((resolve,reject) => {
        ffmpegProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`ffmpeg process exited with code ${code}`)
                resolve();
            } else {
                console.log(`ffmpeg process exited with code ${code}`)
                reject(`ffmpeg process exited with code ${code}`);
            }
        });
    });
    
    // Prints messages on 'close' and on 'error'
    ffmpegProcess.on('close', (code) => {
        console.log(`ffmpeg process exited with code ${code}`)
    })

    ffmpegProcess.on('SIGINT', () => {
        console.log('Received interrupt signal. Stopping ffmpeg process..')
        ffmpegProcess.kill('SIGISNT');
    })

    // Logs data as they happen
    // Error in this case is not logging error but
    // it logs live encoding updates
    ffmpegProcess.stderr.on('data', (data) => {
        console.error(`ffmpeg: ${data}`)
    })
    ffmpegProcess.stdout.on('data', (data) => {
        console.log(`ffmpeg stdout: ${data}`)
    })

    // Runs spawnPromise function created above
    await spawnPromise;
}



// On App Quit, quits FFMPEG process if process is running (maybe should be in main.js?)
app.on('before-quit', (event) => {
    if (ffmpegProcess) {
        console.log("Terminating FFmpeg process before quitting...")
        ffmpegProcess.kill();
    }
    setTimeout(() => {
        app.quit();
    }, 3000);
})

module.exports = webmConvertor;