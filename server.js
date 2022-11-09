const express = require("express");
var app = express();
const cors = require("cors");
const got = require("got");
const youtubedl = require("youtube-dl");
const ytdl = require("ytdl-core-custom");
const request = require("request");
const events = require("events");
const contentdisposition = require("content-disposition");
const archiver = require("archiver");
const axios = require("axios");
const fs = require("graceful-fs");
const toBlobURL = require("stream-to-blob-url");
const stream = require("stream");
//const packer = require("zip-stream");
const packer = require("archiver");
const util = require("util");
const puppeteer = require("puppeteer");
const ffmpeg = require("fluent-ffmpeg");
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
  var audio = req.query.dlmp3 ? true : false;
  var inbrowser = req.query.inbrowser ? true : false;
  console.log("audio: " + req.query.dlmp3);
  console.log("inbrowser: " + req.query.inbrowser);
  ytdl.getInfo(req.query.v, {
    requestOptions: {
      headers: {
        cookie: "key=" + apikey
      }
    }
  }).then(info => {
    var format = ytdl.chooseFormat(info.formats, {
      filter: audio ? format => format.hasAudio : format => format.hasAudio && format.hasVideo,
      quality: "highest"
    });
    var url = format.url;
    res.send(format);
  });
})

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
  var browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-web-security"],
    headless: true,
  });
  var page = await browser.newPage();
  var scriptSrcs = [];
  await page.goto(req.query.q);
  page
    .on("console", (msg) => {
      console.log(`${msg.type().substr(0, 3).toUpperCase()} ${msg.text()}`);
    })
    .on("pageerror", ({ message }) => console.log(message))
    .on("response", (response) =>
      console.log(`${response.status()} ${response.url()}`)
    )
    .on("requestfailed", (request) =>
      console.log(`${request.failure().errorText || request} ${request.url()}`)
    );
  try {
    var document = await page.evaluate(async () => {
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
        try {
          var linkData = new XMLHttpRequest();
          linkData.open("get", href, false);
          linkData.send();
          return linkData.responseText;
        } catch (err) {
          console.log(err);
        }
      }
      async function fileRead(data) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = function () {
            var content = reader.result;
            resolve(content);
          };
          reader.onerror = function (e) {
            reject(e);
          };
          reader.readAsDataURL(data);
        });
      }
      async function getBlobURL(hrefSrc) {
        return new Promise((resolve, reject) => {
          try {
            console.log("called getBlobURL...");
            var request = new XMLHttpRequest();
            request.open("GET", hrefSrc, true);
            request.responseType = "blob";
            request.onload = async () => {
              //var response = fileRead(request.response);
              //console.log("response: " + response);
              resolve(request.response);
            };
            request.send();
          } catch (err) {
            console.log("getBlobURL err: " + err);
            reject(err);
          }
        });
      }
      async function handleEntries(hrefSrc) {
        return new Promise(async (resolve, reject) => {
          var scriptSrc = new URL(
            hrefSrc,
            "https://" + window.location.hostname
          );
          console.log("scriptSrc: " + scriptSrc);

          await fetch(scriptSrc)
            .then((data) => data.text())
            .then((data) => {
              //console.log("data: " + data);
              console.log(window.location.href);
              console.log(
                "blobdata: " +
                  window.URL.createObjectURL(
                    new Blob(["" + data + ""], { type: "text/plain" })
                  )
              );
              resolve("success");
            })
            .catch((err) => {
              console.log("fetch error: " + err);
              resolve(scriptSrc);
            });
          // var request = new XMLHttpRequest();
          // request.open("GET", scriptSrc, false);
          // request.send();
          // console.log("scriptSrc:" + scriptSrc);
          // request.onload = () => {
          //   console.log("successfully loaded xmlhttprequest");
          //   // console.log(request.responseText)
          //   // var blob = new Blob([request.responseText], {type: "text/plain"});
          //   // var blobURL = URL.createObjectURL(blob);
          //   // console.log("blobURL: " + blobURL);
          //   // resolve(blobURL);
          //   // console.log(request.response);
          //   // const reader = new FileReader();
          //   // reader.onload = function() {
          //   //   var content = reader.result;
          //   //   console.log("content: " + content);
          //   //   resolve(content);
          //   // };
          //   // reader.onerror = function(e) {
          //   //   console.log("filereader err: " + e);
          //   //   reject(e);
          //   // };
          //   // reader.readAsDataURL(request.response);
          // };
          // request.onerror = err => {
          //   console.log("getBlobURL err: " + err);
          // };
        });
      }
      var htmlBaseLink =
        "https://tattered-lead-archaeopteryx.glitch.me/get_site_html";
      var badMetas = document.querySelectorAll(
        "meta[http-equiv='content-security-policy' i]"
      );
      for (var i of badMetas) {
        console.log(i.httpEquiv + "   " + i.content);
        await i.remove();
      }
      document.head.innerHTML += `<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-XXXXX-X']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>`;
      var unblockSources = document.createElement("meta");
      unblockSources.httpEquiv = "content-security-policy";
      unblockSources.content = `default-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; script-src 'unsafe-inline' http: https:; script-src-elem 'unsafe-inline' http: https:;style-src 'self' 'unsafe-inline' http: https:; style-src-elem 'self' 'unsafe-inline' http: https:; connect-src 'unsafe-inline' http: https:; img-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; font-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; frame-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; manifest-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; media-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:;`;
      await document.head.appendChild(unblockSources);
      var elementsWithSources = document.querySelectorAll(
        "[src]:not([src='']),[href]:not([href=''],a)"
      );
      for (var elem of elementsWithSources) {
        if (elem.src) {
          var src = new URL(elem.src, "https://" + window.location.hostname);
          src = htmlBaseLink + "?q=" + src;
          elem.src = src;
        } else if (elem.href) {
          var href = new URL(elem.href, "https://" + window.location.hostname);
          href = htmlBaseLink + "?q=" + href;
          elem.href = href;
        }
      }
      // var styles = document.querySelectorAll("link[rel*='stylesheet']");
      // for (var style of styles) {
      //   try {
      //     var styleHref = new URL(
      //       style.href,
      //       "https://" + window.location.hostname
      //     );
      //     styleHref = htmlBaseLink + "?q=" + styleHref;
      //     style.href = styleHref;
      //     // var styleElement = document.createElement("style");
      //     // var styleText = getResource(
      //     //   style.href.charAt(0) === "/"
      //     //     ? window.location.protocol + window.location.hostname + style.href
      //     //     : style.href.indexOf("http") === 0 &&
      //     //       style.href.indexOf("://") === (5 || 6)
      //     //     ? style.href
      //     //     : window.location.protocol + window.location.hostname + style.href
      //     // );
      //     // styleElement.textContent = styleText;
      //     // document.head.appendChild(styleElement);
      //     // style.remove();
      //   } catch (err) {
      //     console.log(err);
      //   }
      // }
      // var scripts = document.querySelectorAll("script[src]:not([src=''])"); //:not([src^='https://www.google-analytics.com']):not([src^='https://connect.facebook.net']):not([src^='https://www.googletagmanager.com']):not([src^='https://ssl.gstatic.com'])");
      // for (var script of scripts) {
      //   var scriptSrc = new URL(
      //     script.src,
      //     "https://" + window.location.hostname
      //   );
      //   scriptSrc = htmlBaseLink + "?q=" + scriptSrc;
      //   script.src = scriptSrc;
      //   // var scriptText = getResource(scriptSrc);
      //   // script.remove();
      //   // var scriptBlob = JSON.stringify(getBlobURL(scriptSrc));
      //   // console.log("scriptBlob: " + scriptBlob);
      //   // var scriptElem = document.createElement("script");
      //   // scriptElem.textContent =
      //   //   "var resourceBlob = new XMLHttpRequest(); resourceBlob.open('get', 'https://tattered-lead-archaeopteryx.glitch.me/get_site_html?q=" +
      //   //   scriptSrc +
      //   //   "', false); var blobURL = URL.createObjectURL(new Blob([resourceBlob.responseText], {type: 'text/plain'}); var metaUnblocker = document.createElement('meta'); metaUnblocker.httpEquiv = 'Content-Security-Policy'; metaUnblocker.content = 'default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eva' ' + blobURL; document.head.appendChild(metaUnblocker);var scriptElem = document.createElement('script'); scriptElem.src = blobURL; document.body.appendChild(scriptElem);}; resourceBlob.send();";
      //   // document.head.appendChild(scriptElem);
      // }
      return document.documentElement.outerHTML;
    });
    res.send(document);
  } catch (err) {
    res.send(err);
    console.error(err);
  }

  await browser.close();
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

var listener = app.listen(process.env.PORT);
console.log("3000 is the port");
