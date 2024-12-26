const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const contentdisposition = require('content-disposition');
const axios = require('axios');
const archiver = require('archiver');
const httpProxy = require('http-proxy');

require('dotenv').config();
const port = process.env.port || 3000;

const getCookies = new Worker('get-cookies.js');
getCookies.onmessage = e => {
  console.log(e.data, 'worker finished.');
}

let app = express();

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

// ffmpeg.setFfmpegPath(process.env.ffmpeg_path);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/watch.html', (req, res) => {
  res.sendFile(__dirname + '/views/watch.html');
});

app.get('/tokybook', async (req, res) => {
  let url = req.query.url;
  let pageData = await axios({
    method: 'GET',
    url: url,
  }).then((page) => page.data);
  res.send(pageData.split('tracks = ')[1]);
});

app.get('/watch', async (req, res, next) => {
  let audio = req.query.audio == 'true';
  let inline = req.query.inline == 'true';

  let options = {
    filter: (e) => (audio ? e.audioBitrate >= 128 : e.hasAudio && e.hasVideo),
    requestOptions: {
      headers: await Bun.file('headers.json').json(),
    },
    range: req.range() !== undefined ? [0] : {},
  };

  let info = await ytdl.getInfo(req.query.v, options).catch(res.end);
  let format = ytdl.chooseFormat(info.formats, options);

  req.url = '';

  // Apparantly, http-proxy is the best way to proxy pipe a video? crazy.

  const proxy = httpProxy.createProxyServer();
  proxy.on('proxyRes', (proxyRes, req, res) => {
    // Set the Content-Disposition header
    res.setHeader('content-disposition', 
      contentdisposition(`${info.videoDetails.title}.${format.container}`, { type: inline ? 'inline' : 'attachment' }));
  });

  proxy.web(req, res, { target: format.url, changeOrigin: true }, err => {
    console.error(err);
    res.end(err);
  });
});

app.get('/playlistsetup', (req, res) => {
  let playlistURL;
  if (req.query.list.includes('youtu' && 'http' && '?list=' && '/playlist'))
    playlistURL =
      'https://www.youtube.com/playlist' + req.query.list.split('/playlist')[1];
  else if (req.query.list.indexOf('PL') === 0)
    playlistURL = 'https://www.youtube.com/playlist?list=' + req.query.list;
  else if (
    req.query.list.includes('youtu' && 'http' && '&list=' && '/playlist')
  )
    playlistURL =
      'https://www.youtube.com/playlist?list=' +
      req.query.list.split('&list=')[1];
  else res.redirect('/');
  axios({
    method: 'GET',
    url: playlistURL,
  })
    .then((body) => {
      let unParsedBody = body.data.split(`let ytInitialData = `)[1];
      unParsedBody = unParsedBody.split(`;</script>`)[0];
      let parsedBody = JSON.parse(unParsedBody);
      let playlistTitle;
      try {
        playlistTitle = parsedBody.metadata.playlistMetadataRenderer.title;
      } catch (err) {
        res.send(parsedBody);
      }
      let contents =
        parsedBody.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer
          .content.sectionListRenderer.contents[0].itemSectionRenderer
          .contents[0].playlistVideoListRenderer;
      contents.playlistTitle = playlistTitle;
      for (let i in contents.contents) {
        if (
          contents.contents[i].playlistVideoRenderer &&
          contents.contents[i].playlistVideoRenderer.thumbnail.thumbnails[0]
            .url == 'https://i.ytimg.com/img/no_thumbnail.jpg'
        )
          delete contents.contents[i];
      }
      //console.log(contents);
      //res.send(contents)
      res.render(__dirname + '/views/playlist', { contents: contents });
      //console.log(__dirname);
      //console.log(playlistTitle);
    })
    .catch((err) => res.send(err));
});

app.get('/playlist', async (req, res) => {
  let audio = req.query.audio;
  try {
    audio = audio.toString() === 'true';
  } catch (e) {
    audio = false;
  }
  console.log('pending...');
  console.log(audio);
  let video_ids = JSON.parse(req.query.video_ids);
  let playlist_name = req.query.playlist_name;
  let playlist = new archiver('zip', { zlib: { level: 9 } });
  playlist.on('error', (err) => {
    throw err;
  });
  res.setHeader(
    'Content-Disposition',
    contentdisposition(playlist_name + '.zip')
  );
  const handleEntries = (videoStream, info) => {
    return new Promise((resolve, reject) => {
      let title = info.videoDetails.title;
      console.log(title);
      console.log({ name: title + (audio == true ? '.mp3' : '.mp4') });
      playlist.append(videoStream, {
        name: title + (audio == true ? '.mp3' : '.mp4'),
      });
      videoStream.on('end', () => {
        console.log('finished downloading');
        resolve(true);
      });
      videoStream.on('error', (err) => {
        console.log(err);
      });
    });
  };
  playlist.pipe(res);
  console.log('downloading playlist, plz don\'t touch...');
  for (let i in video_ids) {
    let vaStream = await axios({
      method: 'get',
      url: `http://localhost:${port}/watch?v=${video_ids[i]}&dlmp3=${audio}`,
      responseType: 'stream',
    }).then((response) => response.data);
    let info = await ytdl.getInfo(video_ids[i]);
    await handleEntries(vaStream, info);
  }
  console.log('done...');
  playlist.finalize();
});

app.get('/get_video_info', async (req, res, next) => {
  if (req.query.video_id != '' && req.query.video_id) {
    let info;
    try {
      res.send(await ytdl.getInfo(req.query.video_id));
    } catch (err) {
      next(err);
    }
  } else {
    res.send(
      'wrong format! /get_video_info?video_id=video id (those characters behind the /watch?v=...& if there is an &)\nalso if you just type in a url or id in the download bar, and click on the /get_video_info, it will show you the video info.'
    );
  }
});

app.get('/tunnel', async (req, res) => {
  res.setHeader('content-disposition', 'inline');
  (
    await axios({
      method: 'get',
      url: req.originalUrl.split('/tunnel?url=')[1],
      responseType: 'stream',
    })
  ).data
    .on('info', console.log)
    .pipe(res);
});

app.use((req, res, next) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(__dirname + '/views/404.html', { url: req.url });
    return;
  }
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }
  res.type('txt').send('Not found');
});

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(port + ' is the port');
});
