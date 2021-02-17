const express = require("express");
const app = express();
const cors = require("cors");
const ytdl = require("ytdl-core");
const fs = require("fs");
const ytdlp = require("youtube-dl");
const path = require("path");

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

function playlist(url) {

  'use strict';
  const video = ytdlp(url);

  video.on('error', function error(err) {
    console.log('error 2:', err)
  })

  let size = 0
  video.on('info', function(info) {
    size = info.size
    let output = path.join(__dirname + '/', size + '.mp4')
    video.pipe(fs.createWriteStream(output))
  })

  let pos = 0
  video.on('data', function data(chunk) {
    pos += chunk.length
    if (size) {
      let percent = (pos / size * 100).toFixed(2)
      process.stdout.cursorTo(0)
      process.stdout.clearLine(1)
      process.stdout.write(percent + '%')
    }
  })

  video.on('next', playlist)
}


app.get("/watch", async (req, res) => {
  console.log(req.query.v);
  if ((req.query.v[0] == "P" && req.query.v[1] == "L") || (req.query.v.indexOf("list=PL") !== -1 && req.query.v.indexOf("you") !== -1)){
    var url;
    if (req.query.v[0] == "P" && req.query.v[1] == "L") url = "https://www.youtube.com/?list="+req.query.v; 
    else if(req.query.v.indexOf("list=PL") !== -1 && req.query.v.indexOf("you") !== -1) {
      var playlistId = req.query.v.substring(req.query.v.indexOf('list=') + 5);
      return "https://www.youtube.com/playlist?list=" + playlistId;
    }
    console.log("PLAYLIST!");
    playlist(req.query.v);
  } else {
  var url = req.query.v;
  var info = await ytdl.getInfo(url);
  var title = info.videoDetails.title;
  console.log(title);
  res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
  ytdl(url, {
    format: "mp4"
  }).pipe(res);
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
