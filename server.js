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

function playlist(url,res) {

  'use strict';
  const video = ytdlp(url);

  video.on('error', function error(err) {
    console.log('error 2:', err)
  })

  let size = 0
  video.on('info', function(info) {
    console.log(info.stderr)
    size = info.size
    //let output = path.join(__dirname + '/', size + '.mp4')
    video.pipe(res)
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

app.get("/playlist", async (req, res) => {
  console.log(req.query)
  res.sendFile(__dirname+"/views/playlist.html");
  console.log("PLAYLIST!");
  var url;
  console.log(req.query.list.indexOf("PL"))
  if (req.query.list.indexOf("PL") === 0) url = "https://www.youtube.com/playlist?list="+req.query.list; 
  else if(req.query.list.includes("list=")){
    url = req.query.list;
  }
  console.log(url);
  playlist(url,res);
})

app.get("/watch", async (req, res) => {
  console.log(req.query)
  var url = req.query.v;
  var info = await ytdl.getInfo(url);
  var title = info.videoDetails.title;
  console.log(title);
  res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
  ytdl(url, {
    format: "mp4"
  }).pipe(res);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
