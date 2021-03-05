window.onerror = function(msg, url, lineNo, columnNo, error) {
  var errorWindow = window.open("", "", "");
  errorWindow.document.write(
    "Message: " +
      msg +
      "<br>URL/Script: " +
      url +
      "<br>Line Number: " +
      lineNo +
      "<br>Column/Char Number: " +
      columnNo +
      "<br>Error: " +
      error
  );
};
var playlistContent = document.getElementById("playlistContainer").children;
for (var playlistContentContainer of playlistContent) {
  playlistContentContainer.style.backgroundColor = "#42f578";
  playlistContentContainer.addEventListener("click", () => {
    //var playlistContentContainerInfo = window.open("", "", "");
    //playlistContentContainerInfo.document.write(playlistContentContainer.style.backgroundColor)
    if (playlistContentContainer.style.backgroundColor != "rgb(66, 245, 120)")
      playlistContentContainer.style.backgroundColor = "rgb(66, 245, 120)";
    else playlistContentContainer.style.backgroundColor = "rgb(245, 66, 66)";
  });
}
