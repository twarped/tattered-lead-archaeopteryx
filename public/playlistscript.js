function windowOnLoad(contents) {
  window.contents = contents;
  var playlistContent = document.getElementById("playlistContainer").children;
  for (var i in playlistContent) {
    //playlistContent[i].videoId = window.contents.contents[i].playlistVideoRenderer.videoId;
    //playlistContent[i].shouldDownload = true;
    playlistContent[i].style.backgroundColor = "#42f578";
    playlistContent[i].onclick = function changeColors() {
      if (!this.shouldDownload) this.shouldDownload = false;
      alert(this.shouldDownload)
      // if (this.style.backgroundColor != "rgb(66, 245, 120)") {
      //   this.style.backgroundColor = "rgb(66, 245, 120)";
      //   this.shouldDownload = true;
      // } else {
      //   this.style.backgroundColor = "rgb(245, 66, 66)";
      //   this.shouldDownload = false;
      // }
    };
  }
}
