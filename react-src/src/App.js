import { useEffect, useState } from "react";
import { ReactComponent as Logo } from "./logo.svg";
import "./App.css";
import { getYoutubeVideoSource } from "./bgPlayer";
import VideoPlayerControls from "./components/playercontrols";
import {
  generateTrackingLines,
  removeTrackingLines,
  removeTrackingDots,
  addTrackingDots,
  adjustCKeyOffset,
  adjustFKeyOffset,
  getKeyTemplate,
  setDistanceBetweenTrackingLines,
  setupCanvas,
  placePixelTrackers
} from "./canvas";

// Import filesystem namespace
import { filesystem, storage, os } from "@neutralinojs/lib";
import {
  downloadVideoToDisk,
  readVideoFromDisk,
  renderCanvasVideoStream,
} from "./utils";

function App() {
  const [hasLoadedCanvas, setHasLoadedCanvas] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [keyDistance, setKeyDistance] = useState(0);
  const [CkeyOffset, setCkeyOffset] = useState(0);
  const [FkeyOffset, setFkeyOffset] = useState(0);

  // Log current directory or error after component is mounted
  useEffect(() => {
    console.log("Reading current dir");
    filesystem
      .readDirectory("./")
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
    loadVideoInBackground();
  }, []);

  async function loadVideoInBackground() {
    const { downloadUrl, ext, height, width } = await getYoutubeVideoSource();
    // await downloadVideoToDisk(downloadUrl, ext);
    let objUrl = await readVideoFromDisk(width, height);
    renderCanvasVideoStream(objUrl, width, height);
    setupCanvas();
    setHasLoadedCanvas(true);
    setCurrentStep(1);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    console.log(ctx.getImageData(150, 100, 10, 10));
  }

  function generateFullPiano() {
    generateTrackingLines();
    setCurrentStep(currentStep + 1);
  }

  function removeFullPiano() {
    setCkeyOffset(0);
    setFkeyOffset(0);
    setDistanceBetweenTrackingLines(0);

    // adjust in canvas.js
    setKeyDistance(0);
    adjustCKeyOffset(0);
    adjustFKeyOffset(0);

    removeTrackingLines();
    addTrackingDots();
    setCurrentStep(currentStep - 1);
  }

  function resetDots() {
    removeTrackingDots();
    addTrackingDots();
  }

  function adjustKeyOffset(key, value) {
    if (key === "C") {
      setCkeyOffset(value);
      adjustCKeyOffset(value);
    }
    if (key === "F") {
      setFkeyOffset(value);
      adjustFKeyOffset(value);
    }

    if (key === undefined) {
      setDistanceBetweenTrackingLines(value);
      setKeyDistance(value);
    }
  }

  async function finalizeNotes() {
    const allValues = getKeyTemplate();

    // save it to the filesystem
    await storage.setData("YT_ID", JSON.stringify(allValues));

    placePixelTrackers(allValues)
  }

  return (
    <div className="px-12 h-full py-4">
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center w-full">
          <Logo className="h-12 w-24 mb-2" />
          <div className="flex w-full">
            <input
              id=""
              className="p-2 h-8 border-2 rounded-md w-full h-24 mt-1"
              placeholder="https://youtuu.be/2GrzF9nnkxk"
            />
          </div>
        </div>
        {currentStep === 1 && (
          <span className="flex gap-4">
            <p>
              Place tracking points on{" "}
              <span className="text-red-500 font-bold text-lg">C</span> &{" "}
              <span className="text-blue-500 font-bold text-lg">D</span> Keys
            </p>
          </span>
        )}
        {currentStep === 2 && (
          <p>Adjust the slider till the keys match the piano keys</p>
        )}
        <div className="relative">
          <div
            id="player"
            className="border-1 w-full rounded-sm"
            style={{ height: "450px" }}
          ></div>
          <div class="canvas-zone absolute top-0" key={"canvas-zone"}>
            <canvas id="canvas" key={"canvas"}></canvas>
          </div>
        </div>

        <div class="mt-4">
          {currentStep === 1 && (
            <div className="flex mt-2 gap-2">
              <button
                id="togglePlayback"
                class="px-4 rounded-md h-8 bg-indigo-500 text-white"
                onClick={generateFullPiano}
              >
                Generate Full Piano
              </button>
              <button
                class="px-4 rounded-md h-8 border-2 text-gray-700"
                onClick={resetDots}
              >
                Re-Draw Dots
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div class="flex items-end justify-between">
              <div className="flex gap-4">
                <div className="w-48">
                  <label class="block mb-1 text-sm font-medium text-gray-900">
                    Key Distance
                  </label>
                  <span className="flex items-center gap-2">
                    <input
                      type="range"
                      min="-25"
                      max="25"
                      value={keyDistance}
                      onChange={(e) => {
                        adjustKeyOffset(undefined, e.target.value);
                      }}
                      className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 rotate-180"
                    />
                    <p gap="2">
                      {(keyDistance * -1).toString().padStart(2, "0")}
                    </p>
                  </span>
                </div>
                {/*<div className="w-48">
                  <label
                    for="CkeyOffset"
                    class="block mb-1 text-sm font-medium text-gray-900"
                  >
                    <span className="text-red-700 text-bold">C</span> Key Offset
                  </label>
                  <span className="flex items-center gap-2">
                    <input
                      type="range"
                      value={CkeyOffset}
                      onChange={(e) => {
                        adjustKeyOffset("C", e.target.value);
                      }}
                      className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <p gap="2">{CkeyOffset.toString().padStart(2, "0")}</p>
                  </span>
                </div>
                <div>
                  <label
                    for="FkeyOffset"
                    class="block mb-1 text-sm font-medium text-gray-900"
                  >
                    <span className="text-green-700 text-bold">F</span> Key
                    Offset
                  </label>
                  <span className="flex items-center gap-2">
                    <input
                      type="range"
                      value={FkeyOffset}
                      onChange={(e) => {
                        adjustKeyOffset("F", e.target.value);
                      }}
                      className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <p gap="2">{FkeyOffset.toString().padStart(2, "0")}</p>
                  </span>
                    </div>*/}
              </div>
              <div className="flex gap-4">
                <button
                  class="px-4 rounded-md h-8 border-2 text-gray-700 mb-1"
                  onClick={removeFullPiano}
                >
                  Adjust Tracking Points
                </button>
                <button
                  id="togglePlayback"
                  class="px-4 rounded-md w-32 h-8 bg-indigo-500 text-white mb-1"
                  onClick={finalizeNotes}
                >
                  See Notes
                </button>
              </div>
            </div>
          )}
          <div className="mt-8">
            {hasLoadedCanvas && <VideoPlayerControls videoId="video1" />}
          </div>
          <p id="debugOutput"></p>
        </div>
      </div>
    </div>
  );
}

export default App;
