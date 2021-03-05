function windowOnLoad(contents) {
  window.contents = contents;
  var playlistContent = document.getElementById("playlistContainer").children;
  for (var i in playlistContent) {
    playlistContent[i].videoId = window.contents.contents[i].playlistVideoRenderer
    playlistContent[i].shouldDownload = true;
    playlistContent[i].style.backgroundColor = "#42f578";
    playlistContent[i].onclick = function changeColors() {
      if (this.style.backgroundColor != "rgb(66, 245, 120)")
        this.style.backgroundColor = "rgb(66, 245, 120)";
      else this.style.backgroundColor = "rgb(245, 66, 66)";
    };
  }
}
