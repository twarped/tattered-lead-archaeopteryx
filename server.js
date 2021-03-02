const express = require("express");
let app = express();
const cors = require("cors");
const got = require("got");
const youtubedl = require("youtube-dl");
const request = require("request");
const events = require("events");
const contentdisposition = require("content-disposition");
const archiver = require("archiver");
const apikey = process.env.api_key;

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/watch", (req, res) => {
  if
  youtubedl.getInfo(req.query.v, function(err, info) {
    var title =
      info.title.indexOf(".") === info.title.length - 1
        ? info.title.substring(0, info.title.length - 1) + ".mp4"
        : info.title + ".mp4";
    if (!req.query.inbrowser)
      res.header("Content-Disposition", contentdisposition(title));
    request.get(info.url).pipe(res);
  });
});

app.get("/playlist", async (req, res) => {
  request.get("https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr", (err, body) => {
    res.send(body.body)
  })
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
