var query = window.location.search.split("?").join("").split("&");
var queryParams = {}
for (var i of query) {
  var o = i.split("=")
  queryParams[o[0]] = o[1]
}
var playlistIdsRequest = new XMLHttpRequest();
playlistIdsRequest.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var playlistIds = JSON.parse(playlistIdsRequest.responseText.split(`var ytInitialData = `)[1].split(`;</script><link rel="alternate" media="handheld" href="https://m.youtube.com/playlist?list=`)[0]);
      var playlistTitle = playlistIds.metadata.playlistMetadataRenderer.title;
    }
};
if (queryParams.list.includes("youtu" && "http" && "?list="))
playlistIdsRequest.open("get", )
function loadPlaylist(playlistTitle, playlistIds) {
  
}