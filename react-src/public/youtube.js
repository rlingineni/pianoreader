/* eslint-disable no-undef */

// const tag = document.createElement("script");

// tag.src = "https://www.youtube.com/iframe_api";
// const firstScriptTag = document.getElementsByTagName("script")[0];
// firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// const YT_ID = "2GrzF9nnkxk"; //"a_VDxdlxER8";

// // 3. This function creates an <iframe> (and YouTube player)
// //    after the API code downloads.
// var player;

// function onYouTubeIframeAPIReady() {
//   // eslint-disable-next-line no-undef
//   player = new YT.Player("player", {
//     videoId: YT_ID,
//     playerVars: {
//       playsinline: 1,
//       rel: 0,
//       iv_load_policy: 3,
//       controls: 1,
//     },
//     events: {
//       onReady: onPlayerReady,
//       onStateChange: onPlayerStateChange,
//     },
//   });
// }

// // 4. The API will call this function when the video player is ready.
// function onPlayerReady(event) {
//   // do nothing
// }

// // 5. The API calls this function when the player's state changes.
// //    The function indicates that when playing a video (state=1),
// //    the player should play for six seconds and then stop.
// var done = false;
// function onPlayerStateChange(event) {
//   // eslint-disable-next-line no-undef
//   if (event.data === YT.PlayerState.PLAYING && !done) {
//   }
// }
