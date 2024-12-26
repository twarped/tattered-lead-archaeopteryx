const tofuPPAccepted = localStorage.getItem('tofu-pp-accepted');

const downloadbutton = document.getElementById("downloadbutton");
const inline = document.getElementById("inline");
const audio = document.getElementById("audio");
const tofuPP = document.getElementById('tofu-pp');
const accept = document.getElementById('tofu-pp-accept');
const decline = document.getElementById('tofu-pp-decline');

function newTab(url) {
  let a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function download(ev) {
  gtag('event', 'clicked_download_button');
  ev.preventDefault();
  var url = document.getElementById("v").value;
  var idcheckerb = /[A-Za-z0-9_-]+/g;
  var urlcheckervideo = /(http(s|):\/\/|)((www\.|)youtu(be\.com|\.be)\/(watch\?v=|!)|(www\.|)youtu\.be\/)[A-Za-z0-9_-]+/g;
  var urlcheckerplaylist = /http(s|):\/\/(www\.|)youtu(be\.com|\.be)\/playlist\?list=[A-Za-z0-9_-]+/g;
  if (
    url.match(urlcheckervideo) ||
    (url.match(idcheckerb) && url.length == (11 || 12))
  ) {
    var wantstodownload = confirm(
      (inline.checked ? (audio.checked ? 'Listen to' : 'Watch') : 'Download') + " the " + (audio.checked ? "audio" : "video") + " with the video url/id of:\n" + url + "?"
    );
    if (wantstodownload == true) {
      gtag('event', `${inline.checked ? 'inline' : 'downloaded'}_${audio.checked ? 'audio' : 'video'}`);
      newTab(
        "/watch?v=" +
          url +
          (inline.checked ? "&inline=true" : "") +
          (audio.checked ? "&audio=true" : "")
      );
    } else {
      gtag('event', 'canceled_video_download');
    }
  } else if (
    url.match(urlcheckerplaylist) ||
    (url.match(idcheckerb) && url.length > 30 && url.length < 40)
  ) {
    var wantstodownload = confirm(
      "Download the " + audio.checked ? 'audio' : '' + "playlist with the id of: \n" + url + "?"
    );
    if (wantstodownload == true) {
      gtag('event', `went_to_${audio.checked ? 'audio' : 'video'}_playlist_setup`);
      newTab(
        "/playlistsetup?list=" +
          url + 
          (audio.checked ? "&audio=true" : "")
      );
    } else {
      gtag('event', 'canceled_playlist_setup');
    }
  } else {
    gtag('event', 'entered_bad_url');
    alert("Type In a Correct Youtube URL or video ID");
  }
};

function openTofuPP(ev) {
  if (ev) ev.preventDefault();
  tofuPP.style.display = 'inline';
}

function closeTofuPP() {
  tofuPP.style.display = 'none';
}

function acceptTofuPP() {
  gtag('event', 'accepted_tofu_pp');
  localStorage.setItem('tofu-pp-accepted', 'true');
  closeTofuPP();
  downloadbutton.removeEventListener('click', openTofuPP);
  downloadbutton.addEventListener('click', download);
}

function declineTofuPP() {
  gtag('event', 'declined_tofu_pp');
  localStorage.setItem('tofu-pp-accepted', 'false');
  closeTofuPP();
  downloadbutton.removeEventListener('click', download);
  downloadbutton.addEventListener('click', openTofuPP);
}

downloadbutton.addEventListener('click', openTofuPP);
accept.addEventListener('click', acceptTofuPP);
decline.addEventListener('click', declineTofuPP);

if (tofuPPAccepted) acceptTofuPP();