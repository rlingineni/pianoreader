import { useState, useEffect } from "react";
import { ReactComponent as Logo } from "./logo.svg";
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
  adjustTrackerSenitivity,
  setURLParams,
  setCanvasFromParams,
} from "./canvas";

// Import filesystem namespace
import { renderCanvasVideoStream } from "./utils";
import { NotesViewer } from "./components/notesviewer";
import SelectList from "./components/selectlist";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

function App() {
  const isMobile = useIsMobile();

  const [canvasState, setCanvasState] = useState("info"); // fetching, downloading, done, error

  const [currentStep, setCurrentStep] = useState(0);

  const [visibleNotes, setVisibleNotes] = useState([]);

  const [keyDistance, setKeyDistance] = useState(0);
  const [trackerRowHeight, setTrackerRowHeight] = useState(400);
  const [trackerSensitivity, setTrackerSensitivity] = useState(33);

  let initVideoTime = 5;

  function loadFromURLParams() {
    const params = new URLSearchParams(window.location.search);

    setKeyDistance(Number(params.get("kd")) || 0);
    setTrackerRowHeight(Number(params.get("h")) || 400);
    setTrackerSensitivity(Number(params.get("s")) * 100);
    initVideoTime = params.get("t");
  }
  async function loadVideoFromFile(src) {
    // contents of this function should not change (since it's intialized in setupCanvas)
    const onAnimFrame = async () => {
      const notes = getNotesForCurrentFrame();
      if (notes && notes.length > 0) {
        setVisibleNotes(notes);
      }
    };

    try {
      loadFromURLParams();
      setCanvasFromParams();
      renderCanvasVideoStream(src, 1280, 1080, initVideoTime);
      await setupCanvas(onAnimFrame);
      setCanvasState("done");
      setCurrentStep(1);
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

  function changeTrackerSensitivity(value) {
    setTrackerSensitivity(value);
    adjustTrackerSenitivity(value);
    placePixelTrackers(getKeyTemplate(), trackerRowHeight);
    setURLParams();
  }

  async function finalizeNotes() {
    const allValues = getKeyTemplate();

    placePixelTrackers(allValues, trackerRowHeight);
    setCurrentStep(currentStep + 1);
    setURLParams();
  }

  function onTrackerRowHeightChange(value) {
    setTrackerRowHeight(value);
    placePixelTrackers(getKeyTemplate(), value);
    setURLParams();
  }

  function getInfoScreen() {
    if (isMobile) {
      return (
        <div className="text-center">
          <p className="mb-2">This app works best on larger screens</p>
          <div className="flex flex-col gap-2 mt-6">
            <button
              className="underline text-indigo-600 text-sm"
              onClick={() => {
                window.location.href =
                  "https://www.heyraviteja.com/post/portfolio/piano-reader";
              }}
            >
              Read Blog Post
            </button>
            <p className="text-xs">or</p>
            <button
              className="underline text-indigo-600 text-sm"
              onClick={() => {
                window.location.href = "./short-demo.html";
              }}
            >
              Watch Demo Video
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="mb-2"> Try an example tutorial, or load a file </p>
        <div className="flex flex-col gap-2">
          {[
            {
              name: "someday - OneRepublic",
              url: "http://localhost:3000/?c1=516.89074219702%2C414.9814808623585&d1=539.8875935571647%2C413.9827154715347&kd=4&h=416&s=0.86&t=5",
            },
            {
              name: "samayama - Hesham Abdul Wahab",
              url: "http://localhost:3000/?c1=444.9134124039784%2C416.9790116440063&d1=461.9121529480362%2C420.97407320730196&kd=1&h=416&s=0.54",
            },
            {
              name: "sunrise-theme - Anirudh",
              url: "http://localhost:3000/?c1=481.90176243651365%2C196.25186027192413&d1=498.9005029805715%2C196.25186027192407&kd=0&h=194&s=0.52&mode=light",
            },
          ].map((song) => (
            <button
              key={song.name}
              onClick={() => {
                function applyParamsFromUrlString(str) {
                  const url = new URL(str);
                  window.history.replaceState(
                    {},
                    "",
                    "?" + url.searchParams.toString()
                  );
                }

                applyParamsFromUrlString(song.url);

                // set the url params for the video
                loadVideoFromFile(`./${song.name.split(" ")[0]}.mp4`);
              }}
            >
              <p className="underline text-indigo-600 text-sm">{song.name}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function getLoaderText() {
    switch (canvasState) {
      case "info":
        return getInfoScreen();
      case "fetching":
        return "Fetching video from youtube";
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
        <div className="flex gap-2 justify-between w-full">
          <div>
            <Logo className="h-12 w-24 mb-3 mr-6" />
            <a
              href="https://www.heyraviteja.com/post/portfolio/piano-reader"
              className="text-xs mt-2 underline"
            >
              about
            </a>
            <a
              href="https://github.com/rlingineni/pianoreader"
              className="text-xs ml-2 underline"
            >
              source
            </a>
            {currentStep !== 0 && (
              <button
                className="ml-2 text-xs mt-2 underline"
                onClick={() => {
                  window.location.reload();
                }}
              >
                reset
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 hidden md:flex">
            <div>
              {currentStep === 0 && (
                <input
                  type="file"
                  accept="video/mp4, video/mov"
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      setCanvasState("downloading");
                      loadVideoFromFile(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="block -mt-4 text-sm text-slate-500 border border-gray-200 rounded-md
        file:mr-4 file:py-1 file:px-4 file:rounded-md
        file:border-0 file:text-sm file:font-semibold
        file:bg-indigo-50 file:text-indigo-700
        hover:file:bg-indigo-100 file:cursor-pointer"
                />
              )}
            </div>
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
          <div className="canvas-zone absolute top-0" key={"canvas-zone"}>
            <canvas id="canvas" key={"canvas"}></canvas>
          </div>
        </div>

        <div className="mt-4">
          {currentStep === 1 && (
            <div>
              <span className="flex gap-4">
                <p>
                  Drag tracking points to{" "}
                  <span className="text-red-500 font-bold text-lg">C1</span> &{" "}
                  <span className="text-blue-500 font-bold text-lg">D1</span>{" "}
                  Keys
                </p>
              </span>

              <div className="flex mt-2 gap-2">
                <button
                  id="togglePlayback"
                  className="px-4 rounded-md h-8 bg-indigo-500 text-white"
                  onClick={() => {
                    generateFullPiano();
                    setCurrentStep(currentStep + 1);
                  }}
                >
                  Generate Full Piano
                </button>
                <button
                  className="px-4 rounded-md h-8 border-2 text-gray-700"
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
              <div className="flex items-end justify-between">
                <div className="flex gap-4">
                  <div className="w-48">
                    <label className="block mb-1 text-sm font-medium text-gray-900">
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
                      <p gap="2">{keyDistance.toString().padStart(2, "0")}</p>
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    className="px-4 rounded-md h-8 border-2 text-gray-700 mb-1"
                    onClick={removeFullPiano}
                  >
                    Adjust Tracker
                  </button>
                  <button
                    id="togglePlayback"
                    className="px-4 rounded-md w-32 h-8 bg-indigo-500 text-white mb-1"
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
                Play the video, and adjust the tracking dots{" "}
                <div className="mx-2 w-2 h-2 bg-red-500" />
                so they light up with each note press
              </p>
              <div className="flex items-end justify-between">
                <div className="flex gap-2 items-center">
                  <div className="w-48 mt-1">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
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
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Sensitivity
                    </label>
                    <span className="flex items-center gap-2">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={trackerSensitivity}
                        onChange={(e) => {
                          changeTrackerSensitivity(parseInt(e.target.value));
                        }}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <p gap="2">
                        {trackerSensitivity.toString().padStart(2, "0")}
                      </p>
                    </span>
                  </div>

                  <div className="w-48 mt-1">
                    <label className="block mb-1 text-sm font-medium text-gray-900">
                      Light up on:
                    </label>
                    <SelectList
                      options={["dark areas", "light areas"]}
                      initialValue={getDectionMode() + " areas"}
                      onChange={(v) => {
                        setDetectionMode(v);
                        placePixelTrackers(getKeyTemplate(), trackerRowHeight);
                      }}
                    />
                  </div>
                </div>
                <button
                  className="px-4 rounded-md h-8 border-2 text-gray-700 mb-1"
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
