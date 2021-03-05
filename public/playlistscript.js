var playlistContent = document.getElementById("playlistContainer").children
playlistContent.forEach(playlistContentContainer => {
  playlistContentContainer.addEventListener("click", () => {
    alert(this.style.backgroundColor)
  })
})
