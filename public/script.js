var downloadbutton = document.getElementById("downloadbutton");
downloadbutton.addEventListener("click", () => {
  var url = document.getElementById("yturl").value;
  var urlchecker = /youtube\.com\/watch(\?|&)v=[a-zA-Z0-9]+/g;
  if (url.match(urlchecker)) {
    var wantstodownload = confirm(
      "Download the video with the link of: \n" + url + "?"
    );
    if (wantstodownload == true) {
      var oldlocation = window.location;
      window.location = window.location.replace("/?","/download?url="+url);
      window.location = oldlocation;
    }
  } else {
    alert("Type In a Correct Youtube URL");
  }
});
