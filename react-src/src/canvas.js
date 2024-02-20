/* eslint-disable no-undef */

let canvas;
let distanceBetweenKeysUserDefined = 0;
let trackingPoint1, trackingPoint2, pianoKeys;

let FkeyWidthOffsetPercent = 0;
let CkeyWidthOffsetPercent = 0;
let video1;

const trackingRectDesign = {
  left: 25,
  top: 334,
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

export function setupCanvas() {
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

  addVideoToCanvas();
}

function addVideoToCanvas() {
  // create html video element
  const video = document.getElementById("video1");
  const { width, height } = getPlayerDetails();

  video1 = new fabric.Image(video, {
    left: 0,
    top: 0,
    angle: 0,
    objectCaching: false,
  });

  // find the center point of the container
  const center = canvas.getCenter();

  // now find the width of the vido

  if (video1.width > canvas.width) {
    video1.scaleToWidth(canvas.width - 20);
  }

  if (video1.getScaledHeight() > canvas.height) {
    video1.scaleToHeight(canvas.height - 10);
  }

  // left is vide/2
  video1.left = center.left - video1.getScaledWidth() / 2;
  video1.top = 0;

  canvas.add(video1);
  video1.selectable = false;
  video1.getElement().play();
  video1.getElement().pause();
  canvas.sendToBack(video1);
  addTrackingDots();

  fabric.util.requestAnimFrame(function render() {
    canvas.renderAll();
    fabric.util.requestAnimFrame(render);
  });

  canvas.backgroundColor = "black";
  video1.opacity = 0.5;
}

export function removeTrackingDots() {
  // remove the tracking points

  canvas.remove(trackingPoint1);
  canvas.remove(trackingPoint2);
  trackingPoint1 = null;
  trackingPoint2 = null;
  canvas.renderAll();
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

export function setDistanceBetweenKeys(value) {
  // set the distance between keys in pixels
  // between -25 and 25
  removeTrackingLines();
  distanceBetweenKeysUserDefined = value;
  generateKeyLocations();
}

export function generateKeyLocations() {
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

  // get the width of the canvas
  const { width } = canvas;
  const keyCount = Math.floor(width / keyWidth);

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

export function removeTrackingLines() {
  for (const key of pianoKeys._objects) {
    canvas.remove(key);
  }
  canvas.remove(pianoKeys);
}

export function adjustCKeyOffset(value) {
  removeTrackingLines();
  CkeyWidthOffsetPercent = value / 100;
  generateKeyLocations();
}

export function adjustFKeyOffset(value) {
  removeTrackingLines();
  // get the value of the range
  FkeyWidthOffsetPercent = value / 100;
  generateKeyLocations();
}

export function copyKeys() {
  const allKeys = [];
  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  const groupCenter = pianoKeys.getPointByOrigin("center", "center");

  // get center of video

  const { scaleX } = video1;

  const offsetFromVideoEdge = pianoKeys._objects[0].left + groupCenter.x;
  console.log("offsetFromInsideOfVideo", offsetFromVideoEdge);

  const distanceToVideoEdge = video1.left;
  console.log("distanceToVideoEdge", distanceToVideoEdge);

  const start = offsetFromVideoEdge - distanceToVideoEdge;
  console.log(start);

  const getLeft = (key) => {
    return key.left + groupCenter.x - distanceToVideoEdge;
  };

  pianoKeys._objects.forEach((key, i) => {
    const left = getLeft(key);
    allKeys.push({
      start: left,
      end: left + key.width,
      key: notes[i % notes.length] + Math.floor(i / notes.length),
    });
  });

  console.log(JSON.stringify(allKeys, 0, 2));

  // copy allKeys to clipboard
  navigator.clipboard.writeText(JSON.stringify(allKeys));

  console.log(allKeys[0])

  return allKeys;
}
