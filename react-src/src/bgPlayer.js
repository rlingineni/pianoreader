// fetch the json from url
import { setupCanvas } from "./canvas";

const YT_ID = "2GrzF9nnkxk"; //"a_VDxdlxER8";

const yt_url = encodeURIComponent(`https://www.youtube.com/watch?v=${YT_ID}`);
console.log(yt_url);

export async function loadYoutubeVideo() {
  const PlayBackDetails = await fetch(
    `https://youtube-dl.wave.video/info?url=${yt_url}`
  );

  console.log(PlayBackDetails);

  const details = await PlayBackDetails.json();

  const videoUrl = details.formats.reverse()[0];

  const { downloadUrl, height, width } = videoUrl;

  const src = downloadUrl;
  console.log(src);

  function renderVideo(src) {
    var video = document.createElement("video");
    video.id = "video1";
    video.src = src;
    video.autoplay = false;
    video.currentTime = 5;
    video.height = height;
    video.width = width;
    video.pause();
    window.document.body.prepend(video);
    video.style.display = "none";
  }

  renderVideo(src);

  // create a video element
  setupCanvas();
}
