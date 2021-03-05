window.onerror = function (msg, url, lineNo, columnNo, error) {
  var errorWindow = window.open("","","")
  errorWindow.document.write = msg + "<br>" + url + "<br>" + lineNo + "<br>" + columnNo + "<br>" + error
}
var playlistContent = document.getElementById("playlistContainer").children
playlistContent.forEach(playlistContentContainer => {
  playlistContentContainer.addEventListener("click", () => {
    alert(this.style.backgroundColor)
  })
})
