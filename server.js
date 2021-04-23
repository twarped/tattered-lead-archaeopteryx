const express = require("express");
let app = express();
const cors = require("cors");
const got = require("got");
const youtubedl = require("youtube-dl");
const ytdl = require("ytdl-core");
const request = require("request");
const events = require("events");
const contentdisposition = require("content-disposition");
const archiver = require("archiver");
const axios = require("axios");
const fs = require("graceful-fs");
const toBlobURL = require("stream-to-blob-url");
const stream = require("stream");
const packer = require("zip-stream");
const util = require('util');
const puppeteer = require('puppeteer');
const apikey = process.env.api_key;


app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

util.inherits(PausablePassThrough, stream.Transform);
function PausablePassThrough(options) {
  stream.Transform.call(this, options);
  this.paused = false;
  this.queuedCallbacks = [];
}

PausablePassThrough.prototype.togglePause = function(paused) {
  this.paused = paused;
  if (!this.paused) {
    while (this.queuedCallbacks.length) {
      this.queuedCallbacks.shift()();
    }
  }
};

PausablePassThrough.prototype._transform = function(chunk, encoding, cb) {
  this.push(chunk);
  if (this.paused) {
    this.queuedCallbacks.push(cb);
  } else {
    cb();
  }
};


app.get("/watch", async (req, res) => {
  var videoStream = await ytdl(req.query.v);
  var pausableStream = new PausablePassThrough();
  const streamVideo = () => {
    videoStream.pipe(pausableStream).pipe(res);
  };
  videoStream.on("info", async info => {
    var title =
      info.videoDetails.title.indexOf(".") ===
      info.videoDetails.title.length - 1
        ? info.videoDetails.title.substring(
            0,
            info.videoDetails.title.length - 1
          ) + ".mp4"
        : info.videoDetails.title + ".mp4";
    if (!req.query.inbrowser) {
      res.header("Content-Disposition", contentdisposition(title));
      streamVideo();
    } else {
      var playbackURL = await ytdl.getVideoPlaybackURL(info);
      request(playbackURL).pipe(res);
    }
  });
  videoStream.on("error", err => {
    res.send(err);
    console.log(err);
  });
});

app.get("/playlistsetup", (req, res) => {
  var playlistURL;
  if (req.query.list.includes("youtu" && "http" && "?list=" && "/playlist"))
    playlistURL =
      "https://www.youtube.com/playlist" + req.query.list.split("/playlist")[1];
  else if (req.query.list.indexOf("PL") === 0)
    playlistURL = "https://www.youtube.com/playlist?list=" + req.query.list;
  else if (req.query.list.includes("youtu" && "http" && "&list=" && "/watch"))
    playlistURL =
      "https://www.youtube.com/playlist?list=" +
      req.query.list.split("&list=")[1];
  else res.redirect("/");
  //console.log(playlistURL)
  request.get(playlistURL, (err, body) => {
    //"https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr"
    var parsedBody = JSON.parse(
      body.body
        .split(`var ytInitialData = `)[1]
        .split(
          `;</script><link rel="alternate" media="handheld" href="https://m.youtube.com/playlist?list=`
        )[0]
    );
    var playlistTitle = parsedBody.metadata.playlistMetadataRenderer.title;
    var contents =
      parsedBody.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer
        .content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
        .playlistVideoListRenderer;
    contents.playlistTitle = playlistTitle;
    for (var i in contents.contents) {
      //console.info(contents.contents)
      if (
        contents.contents[i].playlistVideoRenderer.thumbnail.thumbnails[0]
          .url == "https://i.ytimg.com/img/no_thumbnail.jpg"
      )
        delete contents.contents[i];
    }
    //res.send(contents)
    res.render(__dirname + "/views/playlist", { contents: contents });
    //console.log(__dirname)
    //console.log(playlistTitle);
  });
});


app.get("/playlist", async (req, res) => {
  console.log("pending...");
  var pausableStream = new PausablePassThrough();
  var video_ids = JSON.parse(req.query.video_ids);
  var playlist_name = req.query.playlist_name;
  var playlist = new packer();
  res.setHeader(
    "Content-Disposition",
    contentdisposition(playlist_name + ".zip")
  );
  const handleEntries = videoStream => {
    return new Promise((resolve, reject) => {
      videoStream.on("info", info => {
        var title = info.videoDetails.title;
        //console.log("Downloading : ", title);
        playlist.entry(
          videoStream,
          { name: title + ".mp4" },
          (error, result) => {
            if (!error) {
              //console.log(`File : ${title} appended.`);
              resolve(result);
            } else {
              //console.error(`Error appending file : ${title}`);
              reject(error);
            }
          }
        );
      });
      videoStream.on("end", () => {
        console.log("finished downloading");
      });
      videoStream.on("error", err => {
        //res.send(err);
        console.log(err);
      });
    });
  };
  playlist.pipe(pausableStream).pipe(res);
  for (var i in video_ids) {
    //console.log(video_ids[i]);
    var videoStream = ytdl(video_ids[i]);
    await handleEntries(videoStream);
  }
  playlist.finish();
  // res.setHeader("Content-Disposition", contentdisposition("README.md"));
  // fs.createReadStream("README.md").pipe(res);
});

app.get("/get_video_info", async (req, res) => {
  if (req.query.video_id != "" && req.query.video_id) {
    res.send(await ytdl.getInfo(req.query.video_id));
  } else {
    res.send("wrong format! /get_video_info?video_id=video id or url")
  }
});

app.get("/waitstuffs", async (req, res) => {
  var browser = await puppeteer.launch();
  var page = await browser.newPage();
  await page.goto(req.query.q);
  page.evaluate( () => {
    res.send(document);
  })
});

var listener = app.listen(process.env.PORT);
console.log("3000 is the port");