const express = require("express");
const app = express();
const cors = require("cors");
const got = require("got");
const youtubedl = require("youtube-dl");
const request = require("request");
const events = require("events");
const contentdisposition = require("content-disposition");
const archiver = require("archiver");

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/watch", (req, res) => {
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

app.get("/playlist", (req, res) => {
  var playlist = youtubedl(
    "https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr"
  );
  playlist.on("info", info => {
    res.send("no error: " + info.split("} {").join(","));
  });
  playlist.on("error", async err => {
    var zip = archiver("zip");
    var data = err.stdout.split("\n");
    data = JSON.parse("[" + data + "]");
    res.header(
      "Content-Disposition",
      contentdisposition(data[0].playlist + ".zip")
    );
    console.log(data.length);
    const looppl = () => {
      return new Promise((resolve, result) => {
        for (var i = 0; i < data.length; i++) {
          var title =
            data[i].title.indexOf(".") === data[i].title.length - 1
              ? data[i].title.substring(0, data[i].title.length - 1) + ".mp4"
              : data[i].title + ".mp4";
          var playlistdl = request.get(data[i].url, (error, response, body) => {
            zip.append(body, { name: title + ".mp4" });
          });
        }
        resolve();
      });
    };
    looppl().then(()=>{
      zip.finalize();
      zip.pipe(res);
    })
  });
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
