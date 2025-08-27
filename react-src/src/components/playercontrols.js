import { useEffect, useState, useRef } from "react";

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

const ForwardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const BackwardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 *
 * @param {{
 * type: "option1" | "option2" | "option3"
 * onTimeUpdate: function
 * videoId: string,
 * onPlaybackToggle: function,
 * }} props Props for the component
 * @returns String
 */
export default function VideoPlayerControls(props) {
  // add a video scrubber with seek controls and play pause button

  const { videoId, onTimeUpdate } = props;

  const videoRef = useRef(document.getElementById(videoId));
  const videoEl = videoRef.current;

  const [currentTime, setCurrentTime] = useState(videoEl.currentTime);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    onTimeUpdate(currentTime);
  }, [onTimeUpdate, currentTime]);

  useEffect(() => {
    // Everything around if statement
    const onUpdate = () => {
      setCurrentTime(videoEl.currentTime);
    };

    videoEl.addEventListener("timeupdate", onUpdate);
    setCurrentTime(videoEl.currentTime);

    videoEl.addEventListener('play',()=>{
      setIsPlaying(true);
    })

    videoEl.addEventListener('pause',()=>{
      setIsPlaying(false);
    })

    return () => {
      videoEl.removeEventListener("timeupdate", onUpdate);
    };
  }, [videoEl]);

  if (!videoEl) {
    return <></>;
  }

  // get the video time and set the scrubber value

  // get total video duration
  const duration = videoEl.duration;

  const scrubberValue = ((currentTime + 0.25) / duration) * 100;

  const onSeekForward = () => {
    videoEl.currentTime += 2;
    setCurrentTime(videoEl.currentTime);
  };

  const onSeekBackward = () => {
    videoEl.currentTime -= 2;
    setCurrentTime(videoEl.currentTime);
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-1">
        <button
          id="playPause"
          className="bg-gray-200 hover:bg-gray-400 p-1"
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
        <button
          className="bg-gray-200 hover:bg-gray-400 p-1"
          onClick={onSeekBackward}
        >
          <BackwardIcon />
        </button>
        <button
          className="bg-gray-200 hover:bg-gray-400 p-1"
          onClick={onSeekForward}
        >
          <ForwardIcon />
        </button>
      </div>
      <div className="w-full flex gap-2 items-center ">
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
          className="w-4/5 h-4 bg-gray-200 appearance-none cursor-pointer dark:bg-gray-700 slider"
        />
        <span gap="2" className="w-24">
          {new Date(currentTime * 1000).toISOString().substr(11, 8)}
        </span>
      </div>
    </div>
  );
}
