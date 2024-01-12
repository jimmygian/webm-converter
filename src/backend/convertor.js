// const { exec } = require('child_process');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const fs = require('fs');
const path = require('path');

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

async function webmConvertor({ input, output, isFolder }) {
    let commandsArr = getCommandsWebm(input, output);

    console.log("\n\n\n===================")
    console.log("CONVERSION BEGUN\n")
    console.log("----------------")
    
    await runCommands(commandsArr);

    console.log("\nCONVERSION FINISHED")
    console.log("===================\n\n\n")
}

async function runCommands(commands) {
    for (const c of commands) {
        try {
            console.log(`Running conversion for: '${c.file}' . .`);
            const { stdout, stderr } = await execPromise(c.command);
            console.log(`  >> File converted.`);
        } catch (error) {
            console.error("  >> !! Error executing command.", error.message);
        }
    }
}

// ========================= //



// HELPER FUNCTIONS

function getCommandsWebm(inputDir, outputDir="") {
    const commands = [];
    const dirFiles = getPathInfoArr(inputDir);

    let outputFolder;
    if (outputDir === "") {
        // Make New Output Folder
        outputFolder = path.join(inputDir, 'output');
        fs.mkdirSync(outputFolder, { recursive: true });
        console.log("No output folder specified. Creating..")
    } else {
        outputFolder = outputDir;
    }

    dirFiles.forEach(file => {
        if (VIDEO_EXTENSIONS.includes(file.ext)) {

            // Create FileName with .webm file extension + output path
            const outputFileName = file.filenameNoExt + NEW_FILE_EXT;
      
            // Constract ffmpeg command
            const outputPath = path.join(outputFolder, outputFileName);
            const command = createFfmpegCommand(file.absolutePath, outputPath);
            commands.push({file: file.filename, command: command})
        }
    })
    return commands;
}


function createFfmpegCommand(input, output) {
    // const cmd = [];
    const ffmpegCall = `${paths.FFMPEG_EXEC} -y -i`
    const quality = `-deadline best` // good, best, realtime
    const videoCodec = `-c:v libvpx-vp9` // Uses VP9 as a video codec 
    const audioCodec =  `-c:a libopus` // Uses OPUS for audio codec
    cmd = [ffmpegCall, input, quality, videoCodec, audioCodec, output];
    const command = `${ffmpegCall} "${input}" ${videoCodec} ${audioCodec} "${output}"`
    // const command = ...cmd;
    return command;
}


// I/O FUNCTIONS

function getPathInfoArr(userPath) {
    const arr = [];
    
    try {
        const stats = fs.statSync(userPath);
       
        if (stats.isFile()) {
            // Handle File Path
            const obj = getPathInfo(userPath);
            arr.push(obj);
            // console.log("getPathInfoArr(file) returned:", arr)
            return arr;
        } else {
            // Handle Dir Path
            const files = fs.readdirSync(userPath);
            files.forEach(fileName => {
                const obj = getPathInfo(userPath, fileName);
                arr.push(obj);
            })
            // console.log("getPathInfoArr(userPath) returned:", arr)
            return arr;
        }
        
    } catch (error) {
        throw new Error(`On 'convertor.js' -> getPathInfoArr(): Failed to get directory stats for path '${userPath}'`, error)
    }
}


function getPathInfo(userPath, fileName=null) {

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

    let pathInfo;
    if (fileName !== null) {
        pathInfo = createObj(path.join(userPath, fileName));
    } else {
        pathInfo = createObj(userPath);
    }
    return pathInfo;
}


module.exports = webmConvertor;