const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const contentdisposition = require("content-disposition");
const axios = require("axios");
const packer = require("archiver");

require("dotenv").config();
const apikey = process.env.api_key;
const port = process.env.port;

var app = express();

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

// ffmpeg.setFfmpegPath(process.env.ffmpeg_path);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/watch.html", (req, res) => {
  res.sendFile(__dirname + "/views/watch.html");
});

app.get("/watch", async (req, res, next) => {
  var audio = req.query.dlmp3;
  var inbrowser = req.query.inbrowser;
  var iboss = req.query.iboss;
  var range = req.headers.range;
  var start = false;
  var end = false;
  if (range != undefined) {
    // console.log(range); //logs the user requested range
    start = parseInt(range.replace("bytes=", "").split("-")[0]);
    var er = range.split("-")[1];
    end = er == "" ? false : parseInt(er);
  }
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
  try {
    iboss = iboss.toString() === "true";
  } catch (e) {
    iboss = false;
  }
  try {
    var info = await ytdl.getInfo(req.query.v).catch((err) => {
      var message = err.stack + "\nerrno: " + err.errno + "\nat ytdl.getInfo";
      console.error(message);
      res.end(message);
      return err;
    });
    if (info.code) return;
    var options = {
      filter: (e) => (audio ? e.audioBitrate == 128 : e.hasAudio && e.hasVideo),
      requestOptions: {
        headers: {
          cookie: "key=" + apikey,
        },
      },
      range: {},
    };
    if (start != false) options.range.start = start;
    if (end != false) options.range.end = end;
    var format = ytdl.chooseFormat(info.formats, options);
    console.log(format);
    console.log(options);

    var stream = ytdl.downloadFromInfo(info, options).on("response", response => {
      console.log(response.req.res.headers);
      var contentLength = response.req.res.headers["content-length"];
      var contentRange = response.req.res.headers["content-range"] || `bytes 0-${contentLength - 1}/${contentLength}`;
      res.writeHead(start ? 206 : 200, {
        "content-disposition": contentdisposition(info.videoDetails.title + "." + format.container, { type: inbrowser ? "inline" : "attachment" }),
        "content-type": format.mimeType,
        "content-length": contentLength,
        "content-range": contentRange,
        "accept-ranges": "bytes",
      })
    }).on("error", err => {
      var message = err.stack + "\nerrno: "+err.errno+"\nat ytdl.downloadFromInfo";
      console.error(message);
      res.end(message);
      return err;
    }).pipe(res);
  } catch (e) {
    next(e);
  }
});

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
  axios({
    method: "GET",
    url: playlistURL,
  }).then((body) => {
    var unParsedBody = body.data.split(`var ytInitialData = `)[1];
    unParsedBody = unParsedBody.split(`;</script>`)[0];
    var parsedBody = JSON.parse(unParsedBody);
    var playlistTitle = parsedBody.metadata.playlistMetadataRenderer.title;
    var contents =
      parsedBody.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer
        .content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
        .playlistVideoListRenderer;
    contents.playlistTitle = playlistTitle;
    for (var i in contents.contents) {
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
  try {
    audio = audio.toString() === "true";
  } catch (e) {
    audio = false;
  }
  console.log("pending...");
  console.log(audio);
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
  const handleEntries = (videoStream, info) => {
    return new Promise((resolve, reject) => {
      var title = info.videoDetails.title;
      console.log(title);
      console.log({ name: title + (audio == true ? ".mp3" : ".mp4") });
      playlist.append(videoStream, {
        name: title + (audio == true ? ".mp3" : ".mp4"),
      });
      videoStream.on("end", () => {
        console.log("finished downloading");
        resolve(true);
      });
      videoStream.on("error", (err) => {
        console.log(err);
      });
    });
  };
  playlist.pipe(res);
  console.log("downloading playlist, plz don't touch...");
  for (var i in video_ids) {
    var vaStream = await axios({
      method: "get",
      url: `http://localhost:${port}/watch?v=${video_ids[i]}&dlmp3=${audio}`,
      responseType: "stream",
    }).then((response) => response.data);
    var info = await ytdl.getInfo(video_ids[i]);
    await handleEntries(vaStream, info);
  }
  console.log("done...");
  playlist.finalize();
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

app.use((req, res, next) => {
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

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(port + " is the port");
});
