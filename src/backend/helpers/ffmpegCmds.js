const path = require('path');

// Converts video files to webm video format
const convToWebm = [
  `-deadline`, `realtime`, 
  `-cpu-used`, `4`, // 0 to 16 - lower values faster
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

// Restores conformed .mov files to stereo .wav files
const DNxHD = [
  `-c:v`, `dnxhd`, 
  `-profile:v`, `dnxhd`, /* Specifies DNxHD profile will be used */
  `-b:v`, `36M`, /* Profile 36 (36Megabits per sec) */
  `-c:a`, `pcm_s16le`, 
  /** -vf: VIDEO FILTERS
   * Video filters are applied before convertion so that the input
   * video can be compatible with the specified convertion.
   * scale= This part of the filter chain resizes the video to fit within a 1920x1080 frame
   *        while maintaining the original aspect ratio.
   * pad filter:
   *        After scaling the video, it may not perfectly fit into a 1920x1080
   *        frame while maintaining the original ratio. This part of the chain
   *        pads the video with black bars if necessary to make the final frame size.
   */
  `-vf`, `scale=1920:1080:force_original_aspect_ratio=decrease, pad=1920:1080:(ow-iw)/2:(oh-ih)/2, format=yuv422p`,
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
    case "DNxHD":
      args.push(...DNxHD);
      outputFilename = `${pathInfo.filenameNoExt}.mov`;
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