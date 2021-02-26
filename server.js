const express = require("express");
const app = express();
const cors = require("cors");
const got = require("got");
const youtubedl = require("youtube-dl");
const request = require("request");
const contentdisposition = require("content-disposition");

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/watch", (req, res) => {
  youtubedl.getInfo(req.query.v, function(err, info) {
    var title = info.title.substring(0, info.title.length - 1) + ".mp4"
    if (!req.query.inbrowser) res.header("Content-Disposition", contentdisposition(title));
    request.get(info.url).pipe(res)
  });
});

app.get("/playlist", (req, res) => {
  var playlist = youtubedl("https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr");
  playlist.on('info', (info) => {
    res.send("no error: "+info.split("} {"))
  })
  playlist.on('error', (err) => {
    res.send("error: "+err.stdout.split("} {"))
  })
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
