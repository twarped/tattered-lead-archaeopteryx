var ytdl = require("youtube-dl")
var fs = require("fs")
var cors = require("cors")
var url = document.querySelector("#yt-url").value
var downloadbutton = document.querySelector("#download-button")
downloadbutton.addEventListener("click",()=>{
  var video = ytdl(url)
  video.on('info',function(info){
    console.log('Download started')
    console.log('filename: ' + info._filename)
    console.log('size: ' + info.size)
  })
  video.pipe(fs.createWriteStream('myvideo.mp4'))
})