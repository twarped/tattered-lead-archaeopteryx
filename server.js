const express = require("express");
const app = express();
const cors = require("cors");
const ytdlcore = require("ytdl-core");
const got = require("got");
const youtubedl = require("youtube-dl");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const jwt = require("express-jwt");
const cookieparser = require("cookie-parser");
//const axios = require("axios");
const fetch = require("node-fetch");
const request = require("request");

app.use(cookieparser());
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
  //response.send("sucks to be you...");
});

app.get("/watch", (req, res) => {
  youtubedl.getInfo(req.query.v, function(err, info) {
    res.header("Content-Disposition", `attachment; filename="${info.title}.mp4"`);
    res.write("")
    request.get(info.url).pipe(res)
  });
});

app.get("/playlist", (req, res) => {
  youtubedl.getInfo("https://www.youtube.com/playlist?list=PLLu_K5OA-nxzrrmOUB7_NZ2hbIX7qGvfr", function(err, info) {
    res.send(info)
  });
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
