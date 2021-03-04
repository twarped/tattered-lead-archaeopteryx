window.onload = () => {
  var playlistContentContainer = document.body.getElementsByClassName(
    "playlistContentContainer"
  );
  for (var i in playlistContentContainer) {
    playlistContentContainer[i].addEventListener("click", () => {
      if (playlistContentContainer[i].style.backgroundColor != "#42f578")
        playlistContentContainer[i].style.backgroundColor = "#42f578";
      else playlistContentContainer[i].style.backgroundColor = "#f54242";
    });
  }
};
