import { filesystem, os } from "@neutralinojs/lib";

// to-do: add ID as a parameter for all

// download the file from the server
export const downloadVideoToDisk = async (url, ext) => {
  console.log(`curl -L  "${url}" --output video.${ext}`);
  let info = await os.execCommand(`curl -L  "${url}" --output video.${ext}`);
  console.log(`Your Node version: ${info.stdOut}`);
  console.log(`Your Node version: ${info.stdErr}`);
};

// read video as obj url
export const readVideoFromDisk = async () => {

  // read the file from the filesystem
  const data = await filesystem.readBinaryFile("video.mp4");
  console.log(data);
  let view = new Uint8Array(data);

  // use the array buffer to create a blob
  const blob = new Blob([view], { type: "video/mp4" });
  // set the blog as a video src
  const objUrl = URL.createObjectURL(blob);

  return objUrl;
};

// determine if an array of pixels is black or white
export function getBlackOrWhite(pixels) {
  // compute histogram of the pixel from 0-255
  const histogram = new Array(256).fill(0);

  for (const pixel of pixels) {
    const color = (pixel.r + pixel.g + pixel.b) / 3;
    histogram[Math.floor(color)]++;
  }

  // divide the histogram into three parts

  const firstHalf = histogram.slice(0, 85);
  const secondHalf = histogram.slice(85, 170);
  const thirdHalf = histogram.slice(170, 256);

  const firstHalfSum = firstHalf.reduce((acc, curr) => acc + curr, 0);
  const secondHalfSum = secondHalf.reduce((acc, curr) => acc + curr, 0);
  const thirdHalfSum = thirdHalf.reduce((acc, curr) => acc + curr, 0);

  // get the sum with the most pixels
  if (firstHalfSum > secondHalfSum && firstHalfSum > thirdHalfSum) {
    return "black";
  } else if (secondHalfSum > firstHalfSum && secondHalfSum > thirdHalfSum) {
    return "grey";
  } else {
    return "white";
  }
}

// render an invisible video element so we can send to the canvas
export function renderCanvasVideoStream(src, width, height) {
  var video = document.createElement("video");
  video.id = "video1";
  video.src = src;
  video.autoplay = false;
  video.currentTime = 5;
  video.playbackRate = .1;
  video.height = height;
  video.width = width;
  video.pause();
  window.document.body.prepend(video);
  video.style.display = "none";
}
