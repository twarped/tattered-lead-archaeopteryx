var downloadbutton = document.getElementById("downloadbutton");
downloadbutton.addEventListener("click", () => {
  var url = document.getElementById("yturl").value;
  var urlchecker = /youtube\.com\/watch(\?|&)v=[a-zA-Z0-9]+/g;
  if (url.match(urlchecker)) {
    var wantstodownload = confirm(
      "Download the video with the link of: \n" + url + "?"
    );
    if (wantstodownload == true) {
      window.open(
        "https://tattered-lead-archaeopteryx.glitch.me/download?url=" + url
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
    a {
      font-size: 20px;
      position: absolute;
      left: 50%;
      transform: translate(-50%,-50%)
      padding:10px;
      width: 80px;
      color: white;
      background-color: aqua;
      border-radius: 6px;
    }
  </style>
  <a href="https://www.youtube.com/channel/UCqTscCS8dOJ3BTE9UG8ss3w">Youtube</a>
  <br>
  <a href="https://greasyfork.org/en/users/317100-twarped">Greasyfork</a>
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
