const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const fs = require('fs').promises;
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

// I/O
// const inputDir = CURRENT_DIR;
// const inputDir = path.normalize('/Users/dimitris.giannoulis/Desktop/webv/test');
// const outputDir = path.join(inputDir, "output");



// ===== MAIN FUNCTION ===== //

async function webmConvertor(dir) {
    let commandsArr;
    try {
        commandsArr = await getCommandsWebm(dir);
    } catch (error) {
        console.log("On 'convertor.js' -> webConvertor(): Failed to Run", error)
    }

    console.log(" ")
    console.log(" ")
    console.log("===================")
    console.log("CONVERSION BEGUN")
    console.log("----------------")

    for (const command of commandsArr) {
        console.log(`Converting '${command.file}'...`)
        // exec(command.command, (error, stdout, stderr) => {
        //     if (error) {
        //         console.error(`  >> !! Error converting '${command.name}'.`);
        //     } else {
        //         console.log(`  >> Successfully converted '${command.name}'.`, error)
        //     }
        // })
        execCommand(command.command, command.name);
    }
    // console.log("CONVERSION FINISHED")
}

function execCommand (command, name) {
    return new Promise((resovle,reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`  >> !! Error converting '${name}'.`);
            } else {
                console.log(`  >> Successfully converted '${name}'.`, error)
            }
        })
    })
}

// ========================= //



// HELPER FUNCTIONS

async function getCommandsWebm(inputDir) {
    const commands = [];

    try {
        const dirFiles = await getPathInfoArr(inputDir);
    
        // console.log(dirFiles);
        dirFiles.forEach(file => {
            if (VIDEO_EXTENSIONS.includes(file.ext)) {
                // console.log(file);
    
                // Create FileName with .webm file extension + output path
                const outputFileName = file.filenameNoExt + NEW_FILE_EXT;
                const outputFolder = path.join(file.dir, 'output');
                fs.mkdir(outputFolder, { recursive: true });
                const outputPath = path.join(outputFolder, outputFileName);
    
                // Constract ffmpeg command
                const command = createFfmpegCommand(file.absolutePath, outputPath);
                commands.push({file: file.filename, command: command})
            }
        })
        return commands;
    } catch (error) {
        console.error(`On 'convertor.js' -> getCommandsWebm():`, error);
        throw new Error(`On 'convertor.js' -> getCommandsWebm()`);
    }
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
    console.log("COMMAND:", command);
    return command;
}


// I/O FUNCTIONS

async function getPathInfoArr(userPath) {
    const arr = [];
    
    try {
        // Check if path is file
        fs.stat(userPath, (error, stats) => {
            if (error) {
                throw new Error(`On 'convertor.js' -> getPathInfoArr(): Error from fs.stat.`, error)             
            }
            // Handle File Path
            if (stats.isFile()) {
                const obj = getPathInfo(userPath);
                arr.push(obj);
                console.log("getPathInfoArr(file) returned:", arr)
                return arr;
            }     
        });

        // Handle Dir Path
        const files = await fs.readdir(userPath);
        files.forEach(fileName => {
            const obj = getPathInfo(userPath, fileName);
            arr.push(obj);
        })
        console.log("getPathInfoArr(userPath) returned:", arr)
        return arr;
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





async function runCommand(command) {
    try {
        const { stdout, stderr } = await execPromise(command);
        console.log('Success')
        console.log(stdout)
    } catch (error) {
        console.error('Error executing command', error);
    }
}






// // Read contents of inputDir
// fs.readdir(inputDir, (err, files) => {
//     if (err) {
//         console.error('Error reading input directory', err);
//         return;
//     }

//     files.forEach(file => {
//         const filePath = path.join(inputDir, file);
//         const fileExt = path.extname(file).toLowerCase();

//         // Check if the current file has an MP4 extension
//         if (VIDEO_EXTENSIONS.includes(fileExt)) {
//             // Create FileName with .webm file extension + output path
//             const outputFileName = path.basename(file, fileExt) + NEW_FILE_EXT;
//             const outputPath = path.join(outputDir, outputFileName);

//             // Constract ffmpeg command
//             const command = createFfmpegCommand(filePath, outputPath);

//             // Execute FFmpeg command to convert the MP4 file to WEBM format
//             exec(command, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error(`Error converting ${file}`);
//                 } else {
//                     console.log(`Successfully converted '${file}' to '${outputFileName}'.`)
//                 }
//             })
//         }
//     })
//     console.log('finished')
//     return;
// })

module.exports = webmConvertor;