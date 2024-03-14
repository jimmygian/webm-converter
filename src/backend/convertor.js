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
    // console.log("===================")
    console.log("CONVERSION STARTED\n")
    // console.log("------------------------")

    for (let pathInfo of inputArr) {
        try {
            await executeFfmpegCmd(pathInfo, outputPath);
        } catch (error) {
            console.Error(error);
        }
    }

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
    
    // Store Command exec
    const ffmpegCmd = paths.FFMPEG_EXEC;
    // const ffmpegCmd = "ffmpeg"    

    // Store arguments
    const args = [];
    // STAYS THE SAME
    args.push(`-i`);
    args.push(`${pathInfo.absolutePath}`);
    args.push(`-y`);                    /* Overwrites existing files without causing ffmpeg to crush */
    
    // VIDEO TO WEBM CONV
    args.push(`-deadline`, `best`);     /* good, best, realtime */ 
    args.push(`-c:v`, `libvpx-vp9`);    /* Uses VP9 as a video codec */
    args.push(`-c:a`, `libopus`);       /* Uses OPUS for audio codec */
    const outputFilename = `${pathInfo.filenameNoExt}.webm`;
    
    // MOV TO WAV CONV 
    // args.push(`-filter_complex`, `[0:a:0][0:a:1]amerge=inputs=2[a]`);
    // args.push(`-map`, `[a]`);     
    // args.push(`-c:a`, `pcm_s24le`);     
    // const outputFilename = `${pathInfo.filenameNoExt}.wav`;

    // ST CONFORM CONV
    // args.push(`-filter_complex`, `[0:a]channelsplit=channel_layout=stereo[left][right]`);
    // args.push(`-map`, `[left]`);     
    // args.push(`-map`, `[right]`);     
    // args.push(`-c:a`, `pcm_s24le`);     
    // args.push(`-disposition:a`, `+default`);     
    // args.push(`-metadata`, `title=${pathInfo.filenameNoExt}`);     
    // args.push(`-metadata:s:a:0`, `title=${pathInfo.filenameNoExt}.L`);     
    // args.push(`-metadata:s:a:1`, `title=${pathInfo.filenameNoExt}.R`);     
    // const outputFilename = `${pathInfo.filenameNoExt}.mov`;


    // STAYS THE SAME
    const absOutputPath = path.join(outputPath, outputFilename);
    args.push(absOutputPath);

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