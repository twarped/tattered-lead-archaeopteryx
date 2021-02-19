const express = require("express");
const app = express();
const cors = require("cors");
const ytdl = require("ytdl-core");
const fs = require("fs");
//const ytdlp = require("youtube-dl");
const path = require("path");
//const ejs = require("ejs");

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.render(__dirname + "/views/index.ejs");
});

app.get("/watch", async (req, res) => {
  console.log(req.query)
  var url = req.query.v;
  var info = await ytdl.getInfo(url);
  var title = info.videoDetails.title;
  console.log(title);
  res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
  ytdl(url, {
    format: "mp4"
  }).pipe(res);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
