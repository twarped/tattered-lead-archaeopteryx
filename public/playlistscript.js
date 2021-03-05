function windowOnLoad(contents) {
  var playlistContent = document.getElementById("playlistContainer").children;
  alert(contents);
  for (var playlistContentContainer of playlistContent) {
    playlistContentContainer.style.backgroundColor = "#42f578";
    playlistContentContainer.onclick = function changeColors() {
      if (this.style.backgroundColor != "rgb(66, 245, 120)")
        this.style.backgroundColor = "rgb(66, 245, 120)";
      else this.style.backgroundColor = "rgb(245, 66, 66)";
    };
  }
}
