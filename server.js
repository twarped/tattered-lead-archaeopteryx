const express = require("express");
const app = express();
const cors = require("cors");
const ytdl = require("ytdl-core");
const got = require("got");
const youtubedl = require("youtube-dl");
const fs = require("fs");

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/watch", (req, res) => {
  //var video = youtubedl(url,{format:"mp4"})
  youtubedl.getInfo(req.query.v, [], function (err, info) {
    //console.log(err)
    console.log(req.query.v)
    var url = req.query.v;
    //console.log(info);
    var title = info.title;
    //console.log(info.title);
    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
    youtubedl(url, {
      format: "mp4"
    }).pipe(res);
  });
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
