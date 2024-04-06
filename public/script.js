var downloadbutton = document.getElementById("downloadbutton");
var ytbrowser = document.getElementById("ytbrowser");
var ytmp3 = document.getElementById("ytmp3");
downloadbutton.addEventListener("click", () => {
  var url = document.getElementById("yturl").value;
  var idcheckerb = /[A-Za-z0-9_-]+/g;
  var urlcheckervideo = /(http(s|):\/\/|)((www\.|)youtu(be\.com|\.be)\/(watch\?v=|!)|(www\.|)youtu\.be\/)[A-Za-z0-9_-]+/g;
  var urlcheckerplaylist = /http(s|):\/\/(www\.|)youtu(be\.com|\.be)\/playlist\?list=[A-Za-z0-9_-]+/g;
  if (
    url.match(urlcheckervideo) ||
    (url.match(idcheckerb) && url.length == (11 || 12))
  ) {
    var wantstodownload = confirm(
      "Download the " + (ytmp3.checked ? "audio" : "video") + " with the video url/id of:\n" + url + "?"
    );
    if (wantstodownload == true) {
      window.open(
        "/watch?v=" +
          url +
          (ytbrowser.checked ? "&inbrowser=true" : "") +
          (ytmp3.checked ? "&dlmp3=true" : "")
      );
    }
  } else if (
    url.match(urlcheckerplaylist) ||
    (url.match(idcheckerb) && url.length > 30 && url.length < 40)
  ) {
    var wantstodownload = confirm(
      "Download the playlist with the id of: \n" + url + "?"
    );
    if (wantstodownload == true) {
      window.open(
        "/playlistsetup?list=" +
          url + 
          (ytmp3.checked ? "&dlmp3=true" : "")
      );
    }
  } else {
    alert("Type In a Correct Youtube URL");
  }
});
var twarped = document.getElementById("twarped");
twarped.addEventListener("click", () => {
  var twarpedwindow = window.open(
    "about:blank",
    "twarped",
    "innerWidth=200,innerHeight=100"
  );
  twarpedwindow.document.write(`
  <style>
    div {
      text-align: center;
      font-size: 20px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      padding:10px;
      width: 120px;
      color: white;
      background-color: aqua;
      border-radius: 6px;
    }
  </style>
  <div>
  <a href="https://www.youtube.com/channel/UCqTscCS8dOJ3BTE9UG8ss3w" target="_blank">Youtube</a>
  <br>
  <a href="https://greasyfork.org/en/users/317100-twarped" target="_blank">Greasyfork</a>
  </div>
  <script type="text/javascript">
  var atags = document.getElementsByClassName("a")
  for (var i = 0; i < atags.length; i++){
    atags[i].addEventListener("click", () => {
      window.close()
    })
  }
  </script>
  `);
});
