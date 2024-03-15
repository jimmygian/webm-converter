const path = require('path');

// Converts video files to webm video format
const convToWebm = [
  `-deadline`, `best`, 
  `-c:v`, `libvpx-vp9`, 
  `-c:a`, `libopus`
];

// Conforms stereo .wav files into .mov containers
const conform = [
  `-filter_complex`, `[0:a]channelsplit=channel_layout=stereo[left][right]`,
  `-map`, `[left]`,
  `-map`, `[right]`,
  `-c:a`, `pcm_s24le`,
  `-disposition:a`, `+default`,
]

// Restores conformed .mov files to stereo .wav files
const deConform = [
  `-filter_complex`, `[0:a:0][0:a:1]amerge=inputs=2[a]`, 
  `-map`, `[a]`, 
  `-c:a`, `pcm_s24le`
];


// EXPORTED FUNCTION //

const createFfmpegArgs = (pathInfo, outputPath, type) => {
  let outputFilename;

  // Input path
  let args = [`-i`, `${pathInfo.absolutePath}`, `-y`]; 
  
  // In-between args
  switch (type) {
    case "webm":
      args.push(...convToWebm);
      outputFilename = `${pathInfo.filenameNoExt}.webm`;
      break;
    case "deConform":
      args.push(...deConform);
      outputFilename = `${pathInfo.filenameNoExt}.wav`;
      break;
    case "conform":
      args.push(...conform);
      args.push(`-metadata`, `title=${pathInfo.filenameNoExt}`);     
      args.push(`-metadata:s:a:0`, `title=${pathInfo.filenameNoExt}.L`);     
      args.push(`-metadata:s:a:1`, `title=${pathInfo.filenameNoExt}.R`);     
      outputFilename = `${pathInfo.filenameNoExt}.mov`;
      break;
  }

  // Output path
  const absOutputPath = path.join(outputPath, outputFilename);
  args.push(absOutputPath);

  return args;
};


module.exports = {
  createFfmpegArgs,
}