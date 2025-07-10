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
export function getBlackOrWhite(
  pixels,
  { detectionColor = "black", trackerSensitivity } = {}
) {
  // Compute average grayscale (luminance) value for all pixels
  let sum = 0;
  for (const pixel of pixels) {
    sum += 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
  }
  const avgGray = sum / pixels.length; // 0 (black) to 255 (white)

  // Define thresholds for black/white based on trackerSensitivity
  const blackThreshold = 255 * trackerSensitivity;
  const whiteThreshold = 255 * (1 - trackerSensitivity);

  if (avgGray <= blackThreshold) {
    return "black";
  } else if (avgGray >= whiteThreshold) {
    return "white";
  } else {
    // If you want to treat grey as black, just return "black" here
    return "grey";
  }
}

// render an invisible video element so we can send to the canvas
export function renderCanvasVideoStream(src, width, height) {
  // if the video element already exists, remove it
  var existingEl = document.getElementById("video1");
  if (existingEl) {
    existingEl.parentNode.removeChild(video);
  }

  var video = document.createElement("video");
  video.id = "video1";
  video.src = src;
  video.autoplay = false;
  video.currentTime = 5;
  video.playbackRate = 1;
  video.height = height;
  video.width = width;
  video.pause();
  window.document.body.prepend(video);
  video.style.display = "none";
}
