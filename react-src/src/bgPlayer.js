// fetch the json from url
import { setupCanvas } from "./canvas";

const YT_ID = "2GrzF9nnkxk"; //"a_VDxdlxER8";

const yt_url = encodeURIComponent(`https://www.youtube.com/watch?v=${YT_ID}`);
console.log(yt_url);

export async function getYoutubeVideoSource() {
  const PlayBackDetails = await fetch(
    `https://youtube-dl.wave.video/info?url=${yt_url}`
  );

  console.log(PlayBackDetails);

  const details = await PlayBackDetails.json();

  const videoDetails = details.formats.reverse()[0];

  return videoDetails;
}
