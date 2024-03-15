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
const IO = require('./helpers/IO.js');
const ffmpegCmds = require('./helpers/ffmpegCmds.js')

// Constants
const DEFAULT_TYPE = 'webm' /** webm, conform, deConform */
let ffmpegProcess = null;




// ===== MAIN FUNCTION ===== //

async function ffmpegConverter({ input, output, isFolder }) {
    const inputArr = IO.createPathInfoArr(input);

    let outputPath = output;
    if (!output) {
        outputPath = path.join(inputArr[0].dir, 'output');
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // LOGS 'Conversion started' message to the UI
    console.log("CONVERSION STARTED\n")

    // Loops through all input files
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

    console.log(`Running conversion for: '${pathInfo.filename}'.. \n`);

    try {
        // Store Command exec
        const ffmpegCmd = paths.FFMPEG_EXEC;
        // const ffmpegCmd = "ffmpeg"    
    
        const args = ffmpegCmds.createFfmpegArgs(pathInfo, outputPath, type=DEFAULT_TYPE);
    
        // Run command
        ffmpegProcess = spawn(ffmpegCmd, args);
    
        // Creates a promise function to run Process, so that FFMPEG commands are executed 
        // sequencially and not all together
        const spawnPromise = new Promise((resolve,reject) => {
            ffmpegProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`  >> Successfully converted.\n\n`)
                    resolve();
                } else {
                    console.log(`  >> Failed to convert. FFmpeg error code: ${code}\n\n`)
                    reject(`  >> Failed to convert. FFmpeg error code: ${code}\n\n`);
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
    } catch (err) {
        console.error("convertor.js > executeFfmpegCmd error:", err)
    }
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

module.exports = ffmpegConverter;