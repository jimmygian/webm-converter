const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const fs = require('fs').promises;
const path = require('path');

// Constants
const CURRENT_DIR = path.normalize(process.cwd());
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
const inputDir = path.normalize('/Users/dimitris.giannoulis/Desktop/webv/test');
const outputDir = path.join(inputDir, "output");



// // Ensure the output dir exists; if not, create it //try, catch ?
// if (!fs.existsSync(outputDir)) {
//     console.log("Output folder does not exist. Creating now..")
//     fs.mkdirSync(outputDir)
// }

async function webmConvertor(dir) {
    const commands = await createCommands(dir);
    for (command of commands) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error converting`, error);
            } else {
                console.log(`Successfully converted.`)
            }
        })
    }
}
// webmConverter(inputDir);



// HELPER FUNCTIONS

async function createCommands(inputDir) {
    const commands = [];
    const dirFiles = await readDirectory(inputDir);

    // console.log(dirFiles);
    dirFiles.forEach(file => {
        if (VIDEO_EXTENSIONS.includes(file.ext)) {
            // console.log(file);

            // Create FileName with .webm file extension + output path
            const outputFileName = file.basename + NEW_FILE_EXT;
            const outputPath = path.join(outputDir, outputFileName);

            // Constract ffmpeg command
            const command = createFfmpegCommand(file.path, outputPath);
            commands.push(command)
        }
    })

    return commands;
}


function createFfmpegCommand(input, output) {
    // const cmd = [];
    const ffmpegCall = `ffmpeg -y -i`
    const quality = `-deadline best` // good, best, realtime
    const videoCodec = `-c:v libvpx-vp9` // Uses VP9 as a video codec 
    const audioCodec =  `-c:a libopus` // Uses OPUS for audio codec
    cmd = [ffmpegCall, input, quality, videoCodec, audioCodec, output];
    const command = `${ffmpegCall} "${input}" ${videoCodec} ${audioCodec} "${output}"`
    // const command = ...cmd;
    console.log("COMMAND:", command);
    return command;
}


async function readDirectory(userPath) {
    const arr = [];
    
    try {
        // Check if user path is a file
        const stats = await fs.stat(userPath);
        if (stats.isFile()) {
            const obj = createObj(userPath);
            arr.push(obj);
            return arr;
        }

        // Read Directory
        const files = await fs.readdir(userPath);
        files.forEach(file => {
            const obj = createObj(file);
            arr.push(obj);
        })
        return arr;
    } catch (error) {
        console.error('Error reading directory');
        throw error;
    }

    function createObj(file) {
        // Get name and extension
        const filePath = path.join(userPath, file);
        const fileExt = path.extname(file).toLowerCase();

        obj = {
            basename: path.basename(file, fileExt),
            name: file,
            path: path.normalize(filePath),
            ext: fileExt
        }

        if (fileExt !== ''){
            obj['file'] = true;
        } else if (fileExt === '' && file === '.gitignore'){
            obj['file'] = true;
        } else {
            obj['file'] = false;
        }

        return obj
    }
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