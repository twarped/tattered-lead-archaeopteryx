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
    } else {
      alert(this.responseText);
    }
};
var playlistURL;
if (queryParams.list.includes("youtu" && "http" && "?list=" && "/playlist")) playlistURL = queryParams.list; 
else if (queryParams.list.indexOf("PL") === 0) playlistURL = "https://www.youtube.com/playlist?list=" + queryParams.list; 
else if (queryParams.list.includes("youtu" && "http" && "&list=" && "/watch")) playlistURL = "https://www.youtube.com/playlist?list=" + queryParams.list.split("&list=")[1]
console.log("")
playlistIdsRequest.open("get", )
function loadPlaylist(playlistTitle, playlistIds) {
  
}