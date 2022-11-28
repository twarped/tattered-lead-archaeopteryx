const express = require("express");
const cors = require("cors");
const got = require("got");
const youtubedl = require("youtube-dl");
const ytdl = require("ytdl-core-custom");
const request = require("request");
const events = require("events");
const contentdisposition = require("content-disposition");
const archiver = require("archiver");
const axios = require("axios");
const http2Express = require("http2-express-bridge");
const fs = require("graceful-fs");
const toBlobURL = require("stream-to-blob-url");
const stream = require("stream");
const httpsproxyagent = require("https-proxy-agent");
//const packer = require("zip-stream");
const packer = require("archiver");
const util = require("util");
const puppeteer = require("puppeteer");
const coolThing = require("./other-cool-thing.js");
const ffmpeg = require("fluent-ffmpeg");
const miniget = require("miniget");
const https = require("node:https");
//const http2 = require("http2");
//const spdy = require("spdy");
const apikey = process.env.api_key;

var app = express();

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
//app.use(app.router);

app.get("/", (request, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

util.inherits(PausablePassThrough, stream.Transform);
function PausablePassThrough(options) {
  stream.Transform.call(this, options);
  this.paused = false;
  this.queuedCallbacks = [];
}

PausablePassThrough.prototype.togglePause = function (paused) {
  this.paused = paused;
  if (!this.paused) {
    while (this.queuedCallbacks.length) {
      this.queuedCallbacks.shift()();
    }
  }
};

PausablePassThrough.prototype._transform = function (chunk, encoding, cb) {
  this.push(chunk);
  if (this.paused) {
    this.queuedCallbacks.push(cb);
  } else {
    cb();
  }
};

app.get("/watch", async (req, res) => {
  var audio = req.query.dlmp3;
  var inbrowser = req.query.inbrowser;
  try {
    audio = audio.toString() === "true";
  } catch (e) {
    audio = false;
  }
  try {
    inbrowser = inbrowser.toString() === "true";
  } catch (e) {
    inbrowser = false;
  }
  ytdl
    .getInfo(req.query.v, {
      requestOptions: {
        headers: {
          cookie: "key=" + apikey,
        },
      },
    })
    .then((info) => {
      var format = ytdl.chooseFormat(info.formats, {
        filter: audio
          ? (format) => format.hasAudio
          : (format) => format.hasAudio && format.hasVideo,
        quality: "highest",
      })
      var url = format.url;
      var filename = info.videoDetails.title + audio ? ".mp3" : ".mp4";
      res.render(__dirname + "/views/watch", {url, filename, inbrowser})
      // if (inbrowser) {
      //   res.redirect(302, url); //iboss blocks proxy piping, so i just have to redirect you...
      // } else {
      //   //res.header("content-type", audio ? "audio/mpeg" : "video/mp4");
      //   //res.header("content-disposition", contentdisposition(title + ext));
      //   console.log(url);
      //   //console.log(title);
      //   //console.log(audio);
      //   //console.log(inbrowser);
      //   //console.log(ext);
      //   console.log(res.getHeaders());
      //   var pipe = request(url);
      //   var chunks = [];
      //   pipe.on("data", function (chunk) {
      //     chunks.push(chunk);
      //     //console.log(chunk);
      //     //res.write(chunk);
      //   });
      //   pipe.on("end", function () {
      //     //var res2 = Buffer.concat(chunks);
      //     console.log("done");
      //     res.end(chunks.toString());
      //   });
      //}
    }).on("error", err => {
            res.send("something was wrong with your input url...\n\n" + err);
  });
});

// app.get("/watch", async (req, res) => {
//   var audio = req.query.dlmp3 == true ? true : false;
//   var inbrowser = req.query.inbrowser == true ? false : true;
//   console.log("mp3: " + audio);
//   console.log("inbrowser: " + inbrowser);
//   var videoStream = await ytdl(req.query.v, {
//     requestOptions: {
//       headers: {
//         cookie: "key=" + apikey,
//       },
//     },
//     quality: audio ? "highestaudio" : "highest",
//     filter: (format) => format.audioBitrate,
//   });
//   var pausableStream = new PausablePassThrough();
//   const streamVideo = () => {
//     videoStream.pipe(pausableStream).pipe(res);
//   };
//   videoStream.on("info", async (info) => {
//     res.send(info);
//     var title =
//       info.videoDetails.title.indexOf(".") ===
//       info.videoDetails.title.length - 1
//         ? info.videoDetails.title.substring(
//             0,
//             info.videoDetails.title.length - 1
//           )
//         : info.videoDetails.title;
//     function setDis(ext) {
//       res.header("Content-Disposition", contentdisposition(title) + ext);
//     }
//     function setCon(type) {
//       res.header("Content-Type", type);
//     }
//     console.log(inbrowser.toString() == true);
//     if (inbrowser) {
//       console.log("inbrowser");
//       var playbackURL = await ytdl.getVideoPlaybackURL(info, {
//         requestOptions: {
//           headers: {
//             cookie: "key=" + apikey,
//           },
//         },
//         quality: audio ? "highestaudio" : "highest",
//         filter: (format) => format.audioBitrate,
//       });
//       console.log(playbackURL);
//       console.log(info);
//       await request(playbackURL).pipe(res);
//     } else {
//       setDis(audio ? ".mp3" : ".mp4");
//       setCon(audio ? "audio/mpeg" : "video/mp4");
//       if (audio) {
//         var proc = new ffmpeg({ source: videoStream });
//         proc.withAudioCodec("libmp3lame").toFormat("mp3").output(res).run();
//       } else {
//         streamVideo();
//       }
//     }
//   });
//   videoStream.on("error", (err) => {
//     res.send("an error occured, please try again later...");
//     console.log(err);
//   });
// });

app.get("/playlistsetup", (req, res) => {
  var playlistURL;
  if (req.query.list.includes("youtu" && "http" && "?list=" && "/playlist"))
    playlistURL =
      "https://www.youtube.com/playlist" + req.query.list.split("/playlist")[1];
  else if (req.query.list.indexOf("PL") === 0)
    playlistURL = "https://www.youtube.com/playlist?list=" + req.query.list;
  else if (
    req.query.list.includes("youtu" && "http" && "&list=" && "/playlist")
  )
    playlistURL =
      "https://www.youtube.com/playlist?list=" +
      req.query.list.split("&list=")[1];
  else res.redirect("/");
  //console.log(playlistURL)
  request.get(playlistURL, (err, body) => {
    //"https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr"
    //res.send(body.body.split(`var ytInitialData = `)[1].replace(";", ""));
    var unParsedBody = body.body.split(`var ytInitialData = `)[1];
    unParsedBody = unParsedBody.split(`;</script>`)[0];
    var parsedBody = JSON.parse(unParsedBody);
    var playlistTitle = parsedBody.metadata.playlistMetadataRenderer.title;
    var contents =
      parsedBody.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer
        .content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
        .playlistVideoListRenderer;
    contents.playlistTitle = playlistTitle;
    for (var i in contents.contents) {
      //console.info(contents.contents)
      if (
        contents.contents[i].playlistVideoRenderer &&
        contents.contents[i].playlistVideoRenderer.thumbnail.thumbnails[0]
          .url == "https://i.ytimg.com/img/no_thumbnail.jpg"
      )
        delete contents.contents[i];
    }
    //console.log(contents);
    //res.send(contents)
    res.render(__dirname + "/views/playlist", { contents: contents });
    //console.log(__dirname);
    //console.log(playlistTitle);
  });
});

app.get("/playlist", async (req, res) => {
  var audio = req.query.dlmp3;
  console.log("pending...");
  console.log(audio);
  var pausableStream = new PausablePassThrough();
  var video_ids = JSON.parse(req.query.video_ids);
  var playlist_name = req.query.playlist_name;
  var playlist = new packer("zip", { zlib: { level: 9 } });
  playlist.on("error", (err) => {
    throw err;
  });
  res.setHeader(
    "Content-Disposition",
    contentdisposition(playlist_name + ".zip")
  );
  const handleEntries = (videoStream) => {
    return new Promise((resolve, reject) => {
      videoStream.on("info", (info) => {
        var title = info.videoDetails.title;
        console.log(title);
        console.log(videoStream);
        console.log({ name: title + (audio == true ? ".mp3" : ".mp4") });
        playlist.append(videoStream, {
          name: title + (audio == true ? ".mp3" : ".mp4"),
        });
      });
      videoStream.on("end", () => {
        console.log("finished downloading");
      });
      videoStream.on("error", (err) => {
        console.log(err);
      });
    });
  };
  playlist.pipe(res);
  console.log("downloading playlist, plz don't touch...");
  for (var i in video_ids) {
    var audioStream = new PausablePassThrough();
    var videoStream = ytdl(video_ids[i], {
      requestOptions: {
        headers: {
          cookie: "key=" + apikey,
        },
      },
      quality: audio == true ? "highestaudio" : "highest",
    });
    console.log("passed videostream (ytdl)");
    if (audio) {
      var proc = new ffmpeg({ source: videoStream });
      proc
        .withAudioCodec("libmp3lame")
        .toFormat("mp3")
        .output(audioStream)
        .run();
    }
    console.log(audio);
    console.log(audio == true ? "audioStream" : "videoStream");
    //console.log(audio ? audioStream : videoStream)
    await handleEntries(audio == true ? audioStream : videoStream);
  }
  console.log("done...");
  playlist.finish();
});

app.get("/get_video_info", async (req, res) => {
  if (req.query.video_id != "" && req.query.video_id) {
    res.send(await ytdl.getInfo(req.query.video_id));
  } else {
    res.send(
      "wrong format! /get_video_info?video_id=video id (those characters behind the /watch?v=...& if there is an &)\nalso if you just type in a url or id in the download bar, and click on the /get_video_info, it will show you the video info."
    );
  }
});

app.get("/waitstuffs", async (req, res) => {
  coolThing.waitStuffs(req, res);
});

app.get("/get_site_html", (req, res) => {
  res.setHeader("content-type", "text/plain");
  request(req.query.q, (err, response, body) => {
    res.send(body);
  });
});

app.use(function (req, res, next) {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(__dirname + "/views/404.html", { url: req.url });
    return;
  }
  if (req.accepts("json")) {
    res.json({ error: "Not found" });
    return;
  }
  res.type("txt").send("Not found");
});

var options = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem")
};

// var server = spdy.createServer(options, app);
// server.listen

app.listen(process.env.PORT, err => {
  if (err) {
    throw err;
  }
  console.log(process.env.PORT + " is the port");
});
