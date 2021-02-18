var downloadbutton = document.getElementById("downloadbutton");
downloadbutton.addEventListener("click", () => {
  var url = document.getElementById("yturl").value;
  var urlchecker = /(youtube\.com\/watch\?v=|)[a-zA-Z0-9-\-]+/g;
  if (url.match(urlchecker)) {
    var wantstodownload = confirm(
      "Download the video with the link/id of: \n" + url + "?"
    );
    if (wantstodownload == true) {
      window.open(
        "https://tattered-lead-archaeopteryx.glitch.me/watch?v=" + url
      );
    }
  } else if(url.includes("list=")){
    
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
