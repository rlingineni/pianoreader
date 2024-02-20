import { useCallback, useEffect, useState, useRef } from "react";

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 5.25v13.5m-7.5-13.5v13.5"
    />
  </svg>
);

const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
    />
  </svg>
);

/**
 *
 * @param {{
 * type: "option1" | "option2" | "option3"
 * onTick: function
 * videoId: string,
 * onPlaybackToggle: function,
 * }} props Props for the component
 * @returns String
 */
export default function VideoPlayerControls(props) {
  // add a video scrubber with seek controls and play pause button

  const { videoId } = props;
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef(document.getElementById(videoId));
  const videoEl = videoRef.current;

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Everything around if statement
    const onTimeUpdate = () => {
      setCurrentTime(videoEl.currentTime);
    };

    videoEl.addEventListener("timeupdate", onTimeUpdate);
    setCurrentTime(videoEl.currentTime);

    return () => {
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [videoEl]);


  if (!videoEl) {
    return <></>;
  }

  if (!videoEl) {
    return <></>;
  }

  // get the video time and set the scrubber value

  // get total video duration
  const duration = videoEl.duration;

  const scrubberValue = ((currentTime + 0.25) / duration) * 100;

  return (
    <div className="flex gap-2 items-center">
      <div>
        <button
          id="playPause"
          class="bg-gray-200 hover:bg-gray-400 p-1"
          onClick={() => {
            setIsPlaying(!isPlaying);
            if (!isPlaying) {
              videoEl.play();
            } else {
              videoEl.pause();
            }
            if (props.onPlaybackToggle) {
              props.onPlaybackToggle();
            }
          }}
        >
          {!isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      <div className="w-full flex gap-2 items-center mb-1">
        <input
          id="scrubber"
          type="range"
          value={scrubberValue}
          onClick={(e) => {
            videoEl.pause();
          }}
          onChange={(e) => {
            const targetValue = (e.target.value / 100) * duration;
            videoEl.currentTime = targetValue;
            setCurrentTime(targetValue);
          }}
          class="w-4/5 h-4 bg-gray-200 appearance-none cursor-pointer dark:bg-gray-700 slider"
        />
        <span gap="2" className="w-24">
          {new Date(currentTime * 1000).toISOString().substr(11, 8)}
        </span>
      </div>
    </div>
  );
}
