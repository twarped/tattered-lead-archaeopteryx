const express = require("express");
const app = express();
const cors = require("cors");
const ytdl = require("ytdl-core");
const got = require("got");
const youtubedl = require("youtube-dl");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("ffmpeg");

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/watch", (req, res) => {
  //var video = youtubedl(url,{format:"mp4"})
  youtubedl.getInfo(req.query.v, function(err, info) {
    //console.log(err)
    console.log("retrieved info!");
    var url = req.query.v;
    //console.log(info);
    var title = info.title;
    //console.log(info.title);
    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
    const video = youtubedl(url);
    ffmpeg().input(video).pipe(res);
    // var stream = video.pipe(
    //   fs.createWriteStream(
    //     "/rbd/pnpm-volume/46445d14-adc1-4847-b269-fdfb11fa2547/youtubevids/" +
    //       title +
    //       ".mp4"
    //   )
    // );
    // stream.on("finish", () => {
    //   console.log("finished downloading!");
    //   var vidPath = path.join(
    //     "/rbd/pnpm-volume/46445d14-adc1-4847-b269-fdfb11fa2547/youtubevids/"+
    //     title,
    //     ".mp4"
    //   );
    //   var stat = fs.statSync(vidPath);
    //   res.writeHead(200, {
    //     "Content-Type": "video/mp4",
    //     "Content-Length": stat.size
    //   });
    //   var vidStream = fs.createReadStream(vidPath);
    //   vidStream.pipe(res);
    //   fs.unlink(
    //     "/rbd/pnpm-volume/46445d14-adc1-4847-b269-fdfb11fa2547/youtubevids/" +
    //       title +
    //       ".mp4",
    //     err => {
    //       if (err) throw err;
    //     }
    //   );
    // });
  });
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
