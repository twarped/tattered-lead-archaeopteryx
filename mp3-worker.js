const ytdl = require("ytdl-core");
const prism = require("prism-media");
const { OpusEncoder } = require("@discordjs/opus");
const Lame = require("node-lame").Lame;
const { parentPort } = require("worker_threads");
const fs = require("graceful-fs"); 

require("dotenv").config();
const apikey = process.env.api_key;

const workerProcessStream = async (userData) => {
  var { info, audio, format } = userData;

  var options = {
    filter: (e) => (audio ? e.audioBitrate >= 128 : e.hasAudio && e.hasVideo),
    requestOptions: {
      headers: {
        cookie: "key=" + apikey,
      },
    },
    range: {},
  };
  console.log("\n-------------WORKER STARTED-------------\n");
  try {
    var videoStream = ytdl
      .downloadFromInfo(info, options)
      .on("response", (response) => {
        // console.log(response)
        parentPort.postMessage({ response: { req: { res: { headers: response.req.res.headers } } } });
      })
      .on("error", (err) => {
        var message =
          err.stack + "\nerrno: " + err.errno + "\nat ytdl.downloadFromInfo";
        console.warn(message);
        parentPort.postMessage({ error: err });
        return err;
      });
    var decoder = new OpusEncoder(48000, 2);
    var splitDecodedChunk = (decodedChunk) => {
      let leftChannel = [];
      let rightChannel = [];
      for (let i = 0; i < decodedChunk.length; i++) {
        if (i % 2 === 0) {
          leftChannel.push(decodedChunk[i]);
        } else {
          rightChannel.push(decodedChunk[i]);
        }
      }
      return {
        left: new Int16Array(leftChannel),
        right: new Int16Array(rightChannel),
      };
    };

    let opusStream = new prism.opus.WebmDemuxer();

    var totalBytes = 0;

    var pcmFileStream = fs.createWriteStream("audio.pcm");
    var webmFileStream = fs.createWriteStream("audio.webm");

    videoStream.on("data").pipe(opusStream).on("data", (chunk) => {
      totalBytes += chunk.length;
      console.log((totalBytes / format.contentLength) * 100, "%");
      var decoder = new OpusEncoder(48000, 2);
      var decodedChunk = decoder.decode(chunk);
      pcmFileStream.write(decodedChunk);
      webmFileStream.write(chunk);
      var samples = splitDecodedChunk(decodedChunk);
      var encoder = new Lame({
        "output": "buffer",
        "bitrate": 128
      }).setBuffer(decodedChunk);
      encoder.encode().then(() => {
        var encodedChunk = encoder.getBuffer();
        console.log(encodedChunk);
        parentPort.postMessage(encodedChunk, [encodedChunk.buffer]);
      }).catch(error => {
        parentPort.postMessage({error: error});
      });
    });
  } catch (error) {
    parentPort.postMessage({error: error});
  }
};

parentPort.onmessage = (event) => {
  workerProcessStream(event.data);
};
