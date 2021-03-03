var query = window.location.search.split("?").join("").split("&");
var queryParams = {}
for (var i of query) {
  var o = i.split("=")
  queryParams[o[0]] = o[1]
}
//alert(JSON.stringify(queryParams))
var playlistIdsRequest = new XMLHttpRequest();
playlistIdsRequest.open("get", )