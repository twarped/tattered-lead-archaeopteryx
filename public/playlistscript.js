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
alert(window.contents)
for (var playlistContentContainer of playlistContent) {
  playlistContentContainer.style.backgroundColor = "#42f578";
  playlistContentContainer.onclick = function changeColors() {
    if (this.style.backgroundColor != "rgb(66, 245, 120)")
      this.style.backgroundColor = "rgb(66, 245, 120)";
    else this.style.backgroundColor = "rgb(245, 66, 66)";
  };
}
