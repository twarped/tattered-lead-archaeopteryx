const express = require("express");
const app = express();
const cors = require("cors");
const got = require("got");
const youtubedl = require("youtube-dl");
const request = require("request");

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
  //response.send("sucks to be you...");
});

app.get("/watch", (req, res) => {
  console.log(req.query)
  youtubedl.getInfo(req.query.v, function(err, info) {
    res.header("Content-Disposition", `attachment; filename="${info.title}.mp4"`);
    res.write("")
    request.get(info.url).pipe(res)
  });
});

app.get("/playlist", (req, res) => {
  var playlist = youtubedl("https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr");
  playlist.on('info', (info) => {
    res.send(info.split("} {"))
  })
  playlist.on('error', (err) => {
    res.send(err.stdout.split("} {"))
  })
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
