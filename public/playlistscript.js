var query = window.location.search.split("?");
var queryFirst = query.shift();
//alert(JSON.stringify(query))
var queryParams = {}
for (var i of query) {
  var o = i.split("=")
  queryParams[o[0]] = o[1]
}
//alert("list: "+queryParams.list)
// var playlistIdsRequest = new XMLHttpRequest();
// playlistIdsRequest.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//       alert(this.responseText)
//       var playlistIds = JSON.parse(playlistIdsRequest.responseText.split(`var ytInitialData = `)[1].split(`;</script><link rel="alternate" media="handheld" href="https://m.youtube.com/playlist?list=`)[0]);
//       var playlistTitle = playlistIds.metadata.playlistMetadataRenderer.title;
//     } else if (this.readyState == 4 && this.status != 200) {
//       alert("error? : "+this.status)
//     }
// };
var playlistURL;
if (queryParams.list.includes("youtu" && "http" && "?list=" && "/playlist")) playlistURL = "/playlisttest"+queryParams.list.split("/playlist")[1]; 
else if (queryParams.list.indexOf("PL") === 0) playlistURL = "/playlisttest?list=" + queryParams.list; 
else if (queryParams.list.includes("youtu" && "http" && "&list=" && "/watch")) playlistURL = "/playlisttest?list=" + queryParams.list.split("&list=")[1]
window.fetch(playlistURL).then((res) => {
  alert(JSON.stringify(res.body))
}).catch((err) => {
  alert(typeof err)
  alert(err)
  alert(JSON.stringify(err))
})
alert("playlistURL: "+playlistURL)
//playlistIdsRequest.open("get", playlistURL)
//playlistIdsRequest.send();
function loadPlaylist(playlistTitle, playlistIds) {
  
}