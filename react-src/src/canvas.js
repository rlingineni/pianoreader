/*global fabric*/

import { getBlackOrWhite } from "./utils";

let canvas;
let distanceBetweenKeysUserDefined = 0;
let trackingPoint1, trackingPoint2, pianoKeys, pixelTrackingGroup;

let FkeyWidthOffsetPercent = 0;
let CkeyWidthOffsetPercent = 0;
let video1;

let detectionColor = "black";

let mainCanvas;
let ctx;

const trackingRectDesign = {
  left: 170,
  top: 400,
  fill: "red",
  width: 4,
  height: 30,
};

function getPlayerDetails() {
  const element = document.getElementById("player");
  console.log("element", {
    width: element.offsetWidth,
    height: element.offsetHeight,
  });
  return { width: element.offsetWidth, height: element.offsetHeight };
}

/**
 * Fixes the rgb pixel value locations due to retina display and scaling
 *
 * Read More: https://stackoverflow.com/questions/62804500/html-canvas-elements-getimagedata-doesnt-match-content-of-fabricjs-canvas
 * @param number rgb between 0 and 255
 * @returns number
 */
function fixPixels(rgb) {
  return rgb * window.devicePixelRatio;
}

export async function setupCanvas(onAnimFrame) {
  if (canvas) {
    console.log("Canvas already setup");
    return;
  }

  mainCanvas = document.getElementById("canvas");
  ctx = mainCanvas.getContext("2d", { willReadFrequently: true });
  canvas = new fabric.Canvas("canvas");

  const { width, height } = getPlayerDetails();
  canvas.setWidth(width);
  canvas.setHeight(height);
  canvas.preserveObjectStack = true;

  fabric.Object.prototype.set({
    borderColor: "blue",
    borderWidth: 5,
    cornerSize: 0,
    transparentCorners: true,
  });

  var canvas2dBackend = new fabric.Canvas2dFilterBackend();
  fabric.filterBackend = canvas2dBackend;

  await addVideoToCanvas(onAnimFrame);
}

function waitForVideoMetadata(video) {
  return new Promise((resolve) => {
    if (video.readyState >= 1) {
      console.log("Video metadata already loaded");
      resolve();
    } else {
      console.log("Waiting for video metadata to load");
      video.addEventListener("loadedmetadata", resolve, { once: true });
    }
  });
}

/**
 * Adds the video1 element to the canvas
 */
async function addVideoToCanvas(onAnimFrame) {
  // create html video element
  const video = document.getElementById("video1");
  await waitForVideoMetadata(video);

  video1 = new fabric.Image(video, {
    left: 0,
    top: 0,
    angle: 0,
    objectCaching: false,
  });

  // find the center point of the container

  // now find the width of the vido

  console.log("Video width", video.width);
  console.log("Video height", video.height);

  console.log("Canvas width", canvas.width);
  console.log("Canvas height", canvas.height);

  // Use the natural video size for scaling
  const naturalWidth = video.videoWidth;
  const naturalHeight = video.videoHeight;
  const maxWidth = canvas.width - 20;
  const maxHeight = canvas.height;
  const scaleX = maxWidth / naturalWidth;
  const scaleY = maxHeight / naturalHeight;
  const scale = Math.min(scaleX, scaleY);
  console.log(scaleX, scaleY, scale);

  video1.scale(scale);
  video1.setCoords(); // Ensure Fabric recalculates bounds

  console.log(video1.getScaledWidth());

  console.log("Natural width:", naturalWidth);

  // if scaling has to be more than 1, account for the extra retina factor
  const usePixelRatio = scale > 1 ? window.devicePixelRatio : 1;

  // Center horizontally
  video1.left = (canvas.width - video1.getScaledWidth() / usePixelRatio) / 2;
  video1.top = 0;

  canvas.add(video1);
  video1.selectable = false;

  video1.getElement().play();
  video1.getElement().pause();
  canvas.sendToBack(video1);
  addTrackingDots();
  var filter = new fabric.Image.filters.BlackWhite();
  video1.filters.push(filter);

  const isVideoPlaying = (video) =>
    !!(
      video.currentTime > 0 &&
      !video.paused &&
      !video.ended &&
      video.readyState > 2
    );

  fabric.util.requestAnimFrame(function render() {
    if (isVideoPlaying(video1.getElement())) {
      if (onAnimFrame) onAnimFrame();
    }

    canvas.renderAll();
    fabric.util.requestAnimFrame(render);
  });

  canvas.backgroundColor = "black";
}

export function addTrackingDots() {
  if (!trackingPoint1) {
    trackingPoint1 = new fabric.Rect(trackingRectDesign);

    // toggle rotation controls
    // rect.setControlsVisibility({ mtr: false })

    trackingPoint2 = new fabric.Rect({
      ...trackingRectDesign,
      left: trackingPoint1.left + 13,
      fill: "blue",
    });
    canvas.add(trackingPoint1);
    canvas.add(trackingPoint2);
  }

  trackingPoint1.set({ visible: true });
  trackingPoint2.set({ visible: true });
}

export function removeTrackingDots() {
  // remove the tracking points

  canvas.remove(trackingPoint1);
  canvas.remove(trackingPoint2);
  trackingPoint1 = null;
  trackingPoint2 = null;
  canvas.renderAll();
}

/**
 * Sets the distance between piano keys
 * @param {*} value
 */
export function setDistanceBetweenTrackingLines(value) {
  // set the distance between keys in pixels
  // between -25 and 25
  removeTrackingLines();
  distanceBetweenKeysUserDefined = value;
  generateTrackingLines();
}

export function generateTrackingLines() {
  const start = trackingPoint1.left;

  const distanceBetweenKeys =
    Math.abs(trackingPoint1.left - trackingPoint2.left) -
    distanceBetweenKeysUserDefined;

  const keyWidth = trackingPoint1.width;

  // generate piano keys

  // hide the tracking points
  trackingPoint1.set({ visible: false });
  trackingPoint2.set({ visible: false });

  // canvas.remove(trackingPoint2);
  //canvas.remove(trackingPoint1);

  // get the width of the video
  const width = video1.getScaledWidth();
  const keyCount = Math.floor(width / distanceBetweenKeys);

  let currOffset = start;

  const getKeyPlacement = (i) => {
    let distanceBetween = currOffset + distanceBetweenKeys;

    // every 7th key, starting at key 4, we need to add a little extra space
    const isCKey = (i - 1) % 7 === 0;
    if (isCKey) {
      distanceBetween =
        currOffset +
        distanceBetweenKeys -
        distanceBetweenKeys * CkeyWidthOffsetPercent;
    }

    const isFKey = (i - 4) % 7 === 0;
    if (isFKey) {
      distanceBetween =
        currOffset +
        distanceBetweenKeys -
        distanceBetweenKeys * FkeyWidthOffsetPercent;
    }

    if (i === 1) {
      distanceBetween = currOffset;
    }

    let fill = "red";
    if (isCKey) fill = "blue";
    if (isFKey) fill = "green";

    currOffset = distanceBetween;
    return { left: distanceBetween, fill, width: keyWidth, height: 100 };
  };

  // generate the keys
  const keys = [];
  for (let i = 1; i <= keyCount; i++) {
    const key = new fabric.Rect({
      ...trackingRectDesign,
      ...getKeyPlacement(i),
      top: trackingPoint1.top,
    });
    keys.push(key);
    canvas.add(key);
  }

  // group the keys
  pianoKeys = new fabric.Group(keys);
  pianoKeys.selectable = false;

  canvas.add(pianoKeys);
}

/**
 * Removes tracking lines and any pixel trackers
 */
export function removeTrackingLines() {
  for (const key of pianoKeys._objects) {
    canvas.remove(key);
  }
  canvas.remove(pianoKeys);

  if (pixelTrackingGroup) {
    for (const key of pixelTrackingGroup._objects) {
      canvas.remove(key);
    }
    canvas.remove(pixelTrackingGroup);
  }
}

/**
 *
 * @returns a template of the keys and their positions from the tracking lines
 */
export function getKeyTemplate() {
  const allKeys = [];
  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  const groupCenter = pianoKeys.getPointByOrigin("center", "center");

  // const offsetFromVideoEdge = pianoKeys._objects[0].left + groupCenter.x;

  // const distanceToVideoEdge = video1.left;

  // const start = offsetFromVideoEdge - distanceToVideoEdge;

  const getLeft = (key) => {
    return key.left + groupCenter.x; // subtract distanceToVideoEdge used to reset the start
  };

  pianoKeys._objects.forEach((key, i) => {
    const left = getLeft(key);
    allKeys.push({
      start: left,
      end: left + key.width,
      key: notes[i % notes.length] + Math.floor(i / notes.length),
    });
  });

  // console.log(JSON.stringify(allKeys, 0, 2));

  // copy allKeys to clipboard
  // navigator.clipboard.writeText(JSON.stringify(allKeys));

  // console.log(allKeys[0]);

  return allKeys;
}

export function placePixelTrackers(pianoKeyTemplate, trackerRowStart) {
  // remove the tracking points
  removeTrackingLines();
  canvas.renderAll();

  const trackerWidth = pianoKeyTemplate[0].end - pianoKeyTemplate[0].start;
  const pixelRowStart = trackerRowStart || 270;

  const width = video1.width;

  let pixelVisualizerDots = [];

  for (const point of pianoKeyTemplate) {
    if (point.start >= width) {
      continue;
    }

    const trackingRectDesign = {
      left: point.start,
      top: pixelRowStart,
      fill: "red",
      width: trackerWidth,
      height: trackerWidth,
    };

    const rect = new fabric.Rect(trackingRectDesign);
    rect.set("piano-key", point.key);
    canvas.add(rect);
    pixelVisualizerDots.push(rect);
  }

  // draw a row of little 5px tall rectangles on the video to track the keys
  pixelTrackingGroup = new fabric.Group(pixelVisualizerDots);
  canvas.add(pixelTrackingGroup);
  pixelTrackingGroup.selectable = false;

  // set the fill of the pixel tracking group to be transparent
  const pixelRects = pixelTrackingGroup._objects;
  for (const rect of pixelRects) {
    rect.fill = "rgba(0,0,0,0)";
  }
  canvas.renderAll();

  getNotesForCurrentFrame();
}

const dummyPixelRects = [];

export function setDetectionMode(mode) {
  if (mode.includes("light")) {
    detectionColor = "white";
  }
  if (mode.includes("dark")) {
    detectionColor = "black";
  }
}

export function getDectionMode() {
  return detectionColor;
}

export function getNotesForCurrentFrame() {
  if (!pixelTrackingGroup || pixelTrackingGroup._objects.length === 0) return;

  // remove the dummy pixel rects
  for (const rect of dummyPixelRects) {
    canvas.remove(rect);
  }

  // get all the objects in the pixelTrackingGroup
  const pixelRects = pixelTrackingGroup._objects;

  const keyValues = [];

  const groupCenter = pixelTrackingGroup.getPointByOrigin("center", "center");

  const getLeft = (rect) => {
    return rect.left + groupCenter.x;
  };

  const getTop = (rect) => {
    return rect.top + groupCenter.y;
  };

  for (const rect of pixelRects) {
    const pixels = [];
    const top = getTop(rect);
    const left = getLeft(rect);

    rect.fill = "rgba(0,0,0,0)";

    // get the color in a rectangle of pixels
    for (let i = 0; i < rect.width; i++) {
      // get the color in a rectangle of pixels
      for (let j = 0; j < rect.height; j++) {
        const pixel = ctx.getImageData(
          ...[left + i, top + j, 1, 1].map(fixPixels)
        );

        pixels.push({
          r: pixel.data[0],
          g: pixel.data[1],
          b: pixel.data[2],
          a: pixel.data[3],
        });
      }
    }

    // re-color the rect based on the color of the pixels
    const color = getBlackOrWhite(pixels);

    const pianoKey = rect.get("piano-key");
    if (color === detectionColor) {
      keyValues.push(pianoKey);

      // create a rectangle 5 pixels above
      const dummy = new fabric.Rect({
        left: left,
        top: top + rect.height + 2, // draw dot 2 pixels below actual tracker (so we don't pick up red visualizer dots)
        fill: "red",
        width: 5,
        height: 5,
      });
      canvas.add(dummy);

      dummyPixelRects.push(dummy);
    } else {
      rect.fill = "rgba(0,0,0,0)";
    }
  }

  return keyValues;
}
