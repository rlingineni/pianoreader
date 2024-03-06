import { useCallback, useState } from "react";
import { ReactComponent as Logo } from "./logo.svg";
import { ReactComponent as RefreshIcon } from "./refresh.svg";
import "./App.css";
import VideoPlayerControls from "./components/playercontrols";
import Loader from "./components/loader";
import {
  generateTrackingLines,
  removeTrackingLines,
  removeTrackingDots,
  addTrackingDots,
  getKeyTemplate,
  setDistanceBetweenTrackingLines,
  setupCanvas,
  placePixelTrackers,
  getNotesForCurrentFrame,
  setDetectionMode,
  getDectionMode,
} from "./canvas";

// Import filesystem namespace
import { renderCanvasVideoStream } from "./utils";
import { NotesViewer } from "./components/notesviewer";
import SelectList from "./components/selectlist";

function App() {
  const [canvasState, setCanvasState] = useState("info"); // fetching, downloading, done, error

  const [currentStep, setCurrentStep] = useState(0);
  const [videoId, setVideoId] = useState("2GrzF9nnkxk");

  const [visibleNotes, setVisibleNotes] = useState([]);

  const [keyDistance, setKeyDistance] = useState(0);
  const [trackerRowHeight, setTrackerRowHeight] = useState(400);

  async function loadVideoFromFile(src) {
    // contents of this function should not change (since it's intialized in setupCanvas)
    const onAnimFrame = async () => {
      const notes = getNotesForCurrentFrame();
      if (notes && notes.length > 0) {
        setVisibleNotes(notes);
      }
    };

    try {
      renderCanvasVideoStream(src, 1280, 720);
      setupCanvas(onAnimFrame);
      setCanvasState("done");
      setCurrentStep(1);

      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      console.log(ctx.getImageData(150, 100, 10, 10));
    } catch (ex) {
      console.log(ex);
      setCanvasState("error");
    }
  }

  function generateFullPiano() {
    generateTrackingLines();
  }

  function removeFullPiano() {
    setDistanceBetweenTrackingLines(0);

    // adjust in canvas.js
    setKeyDistance(0);

    removeTrackingLines();
    addTrackingDots();
    setCurrentStep(currentStep - 1);
  }

  function resetDots() {
    removeTrackingDots();
    addTrackingDots();
  }

  function adjustKeyOffset(key, value) {
    if (key === undefined) {
      setDistanceBetweenTrackingLines(value);
      setKeyDistance(value);
    }
  }

  async function finalizeNotes() {
    const allValues = getKeyTemplate();

    placePixelTrackers(allValues, trackerRowHeight);
    setCurrentStep(currentStep + 1);
  }

  function onTrackerRowHeightChange(value) {
    setTrackerRowHeight(value);
    placePixelTrackers(getKeyTemplate(), value);
  }

  function getLoaderText() {
    switch (canvasState) {
      case "info":
        return (
          <div className="text-center">
            <p className="mb-2"> Load a Piano Tutorial to Begin </p>
            <button
              onClick={() => {
                loadVideoFromFile("./video.mp4");
              }}
            >
              <p className="underline text-indigo-600 text-sm">
                Try demo video
              </p>
            </button>
          </div>
        );
      case "fetching":
        return "fetching video from youtube";
      case "downloading":
        return "Downloading Video";
      case "done":
        return "Video Ready";
      case "error":
        return "Something went wrong, try refreshing";
      default:
        return "";
    }
  }

  return (
    <div className="px-12 h-full py-4">
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center w-full">
          <Logo className="h-12 w-24 mb-3 mr-6" />
          <div className="flex w-full items-center gap-2 ">
            <input
              type="file"
              accept="video/mp4, video/mov"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  setCanvasState("downloading");
                  loadVideoFromFile(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="block w-full text-sm text-slate-500 border border-gray-200 rounded-md
        file:mr-4 file:py-1 file:px-4 file:rounded-md
        file:border-0 file:text-sm file:font-semibold
        file:bg-indigo-50 file:text-indigo-700
        hover:file:bg-indigo-100 file:cursor-pointer"
            />

            <button
              onClick={() => {
                window.location.reload();
              }}
            >
              <RefreshIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            id="player"
            className="border border-gray-400 w-full rounded-sm "
            style={{ height: "450px" }}
          >
            {canvasState !== "done" && (
              <Loader text={getLoaderText()} status={canvasState} />
            )}
          </div>
          <div class="canvas-zone absolute top-0" key={"canvas-zone"}>
            <canvas id="canvas" key={"canvas"}></canvas>
          </div>
        </div>

        <div class="mt-4">
          {currentStep === 1 && (
            <div>
              <span className="flex gap-4">
                <p>
                  Place tracking points on{" "}
                  <span className="text-red-500 font-bold text-lg">C</span> &{" "}
                  <span className="text-blue-500 font-bold text-lg">D</span>{" "}
                  Keys
                </p>
              </span>

              <div className="flex mt-2 gap-2">
                <button
                  id="togglePlayback"
                  class="px-4 rounded-md h-8 bg-indigo-500 text-white"
                  onClick={() => {
                    generateFullPiano();
                    setCurrentStep(currentStep + 1);
                  }}
                >
                  Generate Full Piano
                </button>
                <button
                  class="px-4 rounded-md h-8 border-2 text-gray-700"
                  onClick={resetDots}
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <p className="mb-4 text-sm">
                Adjust the slider till the keys match the piano keys
              </p>
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
                          adjustKeyOffset(undefined, parseInt(e.target.value));
                        }}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 rotate-180"
                      />
                      <p gap="2">
                        {(keyDistance * -1).toString().padStart(2, "0")}
                      </p>
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    class="px-4 rounded-md h-8 border-2 text-gray-700 mb-1"
                    onClick={removeFullPiano}
                  >
                    Adjust Points
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
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <p className="mb-4 text-sm flex items-center">
                Adjust the trackers <div className="mx-2 w-2 h-2 bg-red-500" />
                height to light up with the notes
              </p>
              <div class="flex items-end justify-between">
                <div className="flex gap-2 items-center">
                  <div className="w-48 mt-1">
                    <label class="block mb-2 text-sm font-medium text-gray-900">
                      Tracker Height
                    </label>
                    <span className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="450"
                        value={trackerRowHeight}
                        onChange={(e) =>
                          onTrackerRowHeightChange(parseInt(e.target.value))
                        }
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <p gap="2">
                        {trackerRowHeight.toString().padStart(2, "0")}
                      </p>
                    </span>
                  </div>
                  <div className="w-48 mt-1">
                    <label class="block mb-1 text-sm font-medium text-gray-900">
                      Light up on:
                    </label>
                    <SelectList
                      options={["light areas", "dark areas"]}
                      selectedValue={
                        getDectionMode() === "white"
                          ? "light areas"
                          : "dark areas"
                      }
                      onChange={setDetectionMode}
                    />
                  </div>
                </div>
                <button
                  class="px-4 rounded-md h-8 border-2 text-gray-700 mb-1"
                  onClick={() => {
                    generateFullPiano();
                    setCurrentStep(currentStep - 1);
                  }}
                >
                  Adjust Piano
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 mb-2 h-0.5 border-t-0 bg-neutral-200  w-full" />

          <div className="my-4">
            {canvasState === "done" && (
              <VideoPlayerControls videoId="video1" onTimeUpdate={() => {}} />
            )}
          </div>
          {currentStep === 3 && (
            <div className="flex justify-center w-full relative">
              <NotesViewer notes={visibleNotes} videoId="video1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
