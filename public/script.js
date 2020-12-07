var downloadbutton = document.getElementById("downloadbutton");
downloadbutton.addEventListener("click", () => {
  var url = document.getElementById("yturl").value;
  var urlchecker = /youtube\.com\/watch(\?|&)v=[a-zA-Z0-9]+/g;
  if (url.match(urlchecker)) {
    var wantstodownload = confirm(
      "Download the video with the link of: \n" + url + "?"
    );
    if (wantstodownload == true) {
      window.open("https://tattered-lead-archaeopteryx.glitch.me/download?url="+url)
    }
  } else {
    alert("Type In a Correct Youtube URL");
  }
});
var twarped = document.getElementById("twarped");
twarped.addEventListener("click", () => {
  window.open()
})
