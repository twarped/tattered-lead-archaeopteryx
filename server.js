const express = require("express");
const app = express();
const cors = require("cors");
const ytdl = require("ytdl-core");
const fs = require("fs");

app.use(express.static("public"));
app.use(cors());

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/download", (res, req) => {
  var url = req.query.url;
  var info = ytdl.getInfo(ytdl.getURLVideoID(url))
  console.log(info)
  res.header("Content-Disposition", `attachment; filename="${"video"}.mp4"`);
  ytdl(url, {
    format: "mp4"
  }).pipe(res);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
