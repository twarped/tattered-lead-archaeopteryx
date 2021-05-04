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
const util = require("util");
const puppeteer = require("puppeteer");
const apikey = process.env.api_key;

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
//app.use(app.router);

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
        contents.contents[i].playlistVideoRenderer &&
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
        playlist.entry(
          videoStream,
          { name: title + ".mp4" },
          (error, result) => {
            if (!error) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
      });
      videoStream.on("end", () => {
        console.log("finished downloading");
      });
      videoStream.on("error", err => {
        console.log(err);
      });
    });
  };
  playlist.pipe(pausableStream).pipe(res);
  for (var i in video_ids) {
    var videoStream = ytdl(video_ids[i]);
    await handleEntries(videoStream);
  }
  playlist.finish();
});

app.get("/get_video_info", async (req, res) => {
  if (req.query.video_id != "" && req.query.video_id) {
    res.send(await ytdl.getInfo(req.query.video_id));
  } else {
    res.send("wrong format! /get_video_info?video_id=video id or url");
  }
});

app.get("/waitstuffs", async (req, res) => {
  var browser = await puppeteer.launch({
    args: ["--no-sandbox"]
  });
  var page = await browser.newPage();
  await page.goto(req.query.q);
  page
    .on("console", msg => {
      console.log(
        `${msg
          .type()
          .substr(0, 3)
          .toUpperCase()} ${msg.text()}`
      );
    })
    .on("pageerror", ({ message }) => console.log(message))
    .on("response", response =>
      console.log(`${response.status()} ${response.url()}`)
    )
    .on("requestfailed", request =>
      console.log(`${request.failure().errorText} ${request.url()}`)
    );
  try {
    var document = await page.evaluate(() => {
      window.onerror = (msg, src, ln, cn, err) => {
        var errorDiv = document.createElement("div");
        errorDiv.textContent =
          "message: " +
          msg +
          "\nsource: " +
          src +
          "\nlinenumber: " +
          ln +
          "\ncolumnnumber: " +
          cn +
          "\nerror: " +
          err;
        document.body.appendChild(errorDiv);
      };
      var newWindow = window.open(window.location.href);
      newWindow.document.body.textContent =
        newWindow.document.documentElement.outerHTML;
      function getQueryStringValue(key) {
        return decodeURIComponent(
          window.location.search.replace(
            new RegExp(
              "^(?:.*[&\\?]" +
                encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
                "(?:\\=([^&]*))?)?.*$",
              "i"
            ),
            "$1"
          )
        );
      }
      function getResource(href) {
        var linkData = new XMLHttpRequest();
        linkData.open("get", href, false);
        linkData.send();
        return linkData.responseText;
      }
      async function fileRead(data) {
        return new Promise((resolve, reject) => {
          let content = "";
          const reader = new FileReader();
          reader.onload = function(e) {
            content = e.target.result;
            console.log(content);
            resolve(content);
          };
          reader.onerror = function(e) {
            reject(e);
          };
          reader.readAsText(data);
        });
      }
      async function getBlobURL(hrefSrc) {
        try {
          var request = new XMLHttpRequest();
          request.open("GET", hrefSrc, false);
          request.responseType = "blob";
          await request.send();
          var reader = new FileReader();
          reader.readAsDataURL(request.response);
          reader.onload = function(e) {
            return e.target.result;
            console.log("DataURL:", e.target.result);
          };
        } catch (err) {
          console.log(err);
          return err;
        }
      }
      var styles = document.querySelectorAll("link[rel*='stylesheet']");
      for (var style of styles) {
        try {
          var styleElement = document.createElement("style");
          var styleText = getResource(
            style.href.charAt(0) === "/"
              ? window.location.protocol + window.location.hostname + style.href
              : style.href.indexOf("http") === 0 &&
                style.href.indexOf("://") === (5 || 6)
              ? style.href
              : window.location.protocol + window.location.hostname + style.href
          );
          styleElement.textContent = styleText;
          document.head.appendChild(styleElement);
          style.remove();
        } catch (err) {
          console.error(err);
        }
      }
      var scripts = document.querySelectorAll("script[src]:not([src=''])"); //:not([src^='https://www.google-analytics.com']):not([src^='https://connect.facebook.net']):not([src^='https://www.googletagmanager.com']):not([src^='https://ssl.gstatic.com'])");
      for (var script of scripts) {
        var scriptSrc = new URL(
          script.src,
          window.location.protocol + window.location.hostname
        );
        // script.src.charAt(0) === "/"
        //   ? getQueryStringValue("q").substring(1) + script.src
        //   : script.src.indexOf("http") === 0 &&
        //     script.src.indexOf("://") === (5 || 6)
        //   ? script.src
        //   : getQueryStringValue("q") + script.src;
        console.log("scriptSrc:" + scriptSrc);
        var blobScriptSrc = getBlobURL(scriptSrc);
        console.log(blobScriptSrc);
        script.src = blobScriptSrc;
        // fetch(scriptSrc)
        //   .then(data => {
        //     var scriptBlob = URL.createObjectURL(data.blob());
        //     script.src = scriptBlob;
        //     console.log("scriptBlob:" + scriptBlob)
        //   })
        //   .catch(err => {
        //     console.log("fetchError:" + err);
        //     var divErr = document.createElement("div");
        //     divErr.innerHTML = JSON.stringify(err);
        //     document.body.appendChild(divErr);
        //   });
      }
      return document.documentElement.outerHTML;
    });
    res.send(document);
  } catch (err) {
    res.send(err);
    console.error(err);
  }

  await browser.close();
});

app.use(function(req, res, next) {
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

var listener = app.listen(process.env.PORT);
console.log("3000 is the port");
