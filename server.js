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
const miniget = require("miniget");
//const ejs = require("ejs");
const apikey = process.env.api_key;

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/watch", async (req, res) => {
  var videoStream = await ytdl(req.query.v);
  const streamVideo = () => {
    videoStream.pipe(res);
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

app.get("/playlist", (req, res) => {
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

app.get("/playlisttest", (req, res) => {
  // axios({
  //   method: "get",
  //   url:"http://www.youtube.com/get_video_info?video_id=L6rK3e7mwcI&html5=1",
  //   responseType: "stream"
  // }).then((data) => {
  //   data.data.pipe(res)
  // }).catch((err) => {
  //   res.send(err)
  // })
  //req.pipe(request("http://www.youtube.com/get_video_info?video_id=L6rK3e7mwcI&html5=1")).pipe(res);
  request.get(
    "https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr",
    (err, body) => {
      //"https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr"
      res.setHeader("Content-Type", "application/json");
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
          .content.sectionListRenderer.contents[0].itemSectionRenderer
          .contents[0].playlistVideoListRenderer;
      contents.playlistTitle = playlistTitle;
      console.log(playlistTitle);
      //res.send(parsedBody)
      res.send(contents);
      //console.log(parsedBody)
    }
  );
  // var placeholder = "PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr";
  // var pageToken = "";
  // const getIds = () => {
  //   return new Promise((resolve, reject) => {
  //     var videoIds = [];
  //     request(
  //       "https://www.googleapis.com/youtube/v3/playlistItems?key=" +
  //         apikey +
  //         "&playlistId=" +
  //         placeholder +
  //         "&part=contentDetails&maxResults=50" +
  //         (pageToken != "" ? "&pageToken=" + pageToken : ""),
  //       (err, body) => {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           var bodies = JSON.parse(body.body);
  //           for (var i of bodies.items) {
  //             videoIds.push(i.contentDetails.videoId);
  //           }
  //           resolve(videoIds);
  //         }
  //       }
  //     );
  //   });
  // };
  // getIds()
  //   .then(videoIds => {
  //     //res.send(videoIds);
  //     for (var i of videoIds) {
  //       setTimeout(() => {
  //         youtubedl.getInfo(i, (err, info) => {
  //           if (err) res.send(err);
  //           else {
  //             console.log(info.url);
  //           }
  //         });
  //       }, 1000);
  //     }
  //   })
  //   .catch(err => {
  //     res.send(err);
  //   });
  // youtubedl.getInfo("https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr", (err, info)=>{
  //   if (err) res.send(err); else res.send(info)
  // })
  // var playlist = youtubedl(
  //   "https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr"
  // );
  // playlist.on("info", info => {
  //   res.send("no error: " + info.split("} {").join(","));
  // });
  // playlist.on("error", err => {
  //   res.send(err)
  //   var zip = archiver("zip");
  //   var data = err.stdout.split("\n");
  //   data = JSON.parse("[" + data + "]");
  //   //console.log(data)
  //   res.header(
  //     "Content-Disposition",
  //     contentdisposition(data[0].playlist + ".zip")
  //   );
  //   console.log(data.length);
  //   res.sendStatus(200)
  //   //zip.pipe(res);
  //   for (var i of data) {
  //     console.log(i.title)
  //     var title =
  //       i.title.indexOf(".") === i.title.length - 1
  //         ? i.title.substring(0, i.title.length - 1) + ".mp4"
  //         : i.title + ".mp4";
  //       if (i == 0) zip.pipe(res)
  //       zip.append(request(i.url), { name: title + ".mp4" });
  //   }
  //   zip.finalize();
  // });
});

var listener = app.listen(process.env.PORT);
console.log("3000 is the port");
