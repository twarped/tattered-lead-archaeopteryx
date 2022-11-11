const puppeteer = require("puppeteer");

exports.waitStuffs = async (req, res) => {
  var browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-web-security"],
    headless: true,
  });
  var page = await browser.newPage();
  var scriptSrcs = [];
  await page.goto(req.query.q);
  page
    .on("console", (msg) => {
      console.log(`${msg.type().substr(0, 3).toUpperCase()} ${msg.text()}`);
    })
    .on("pageerror", ({ message }) => console.log(message))
    .on("response", (response) =>
      console.log(`${response.status()} ${response.url()}`)
    )
    .on("requestfailed", (request) =>
      console.log(`${request.failure().errorText || request} ${request.url()}`)
    );
  try {
    var document = await page.evaluate(async () => {
      function getQueryStringValue(key) {
        return decodeURIComponent(
          window.location.search.replace(
            new RegExp(
              "^(?:.*[&\\?]" +
                encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
                "(?:\\=([^&]*))?)?.*$",
              "i"
            ),
            "$1"
          )
        );
      }
      function getResource(href) {
        try {
          var linkData = new XMLHttpRequest();
          linkData.open("get", href, false);
          linkData.send();
          return linkData.responseText;
        } catch (err) {
          console.log(err);
        }
      }
      async function fileRead(data) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = function () {
            var content = reader.result;
            resolve(content);
          };
          reader.onerror = function (e) {
            reject(e);
          };
          reader.readAsDataURL(data);
        });
      }
      async function getBlobURL(hrefSrc) {
        return new Promise((resolve, reject) => {
          try {
            console.log("called getBlobURL...");
            var request = new XMLHttpRequest();
            request.open("GET", hrefSrc, true);
            request.responseType = "blob";
            request.onload = async () => {
              //var response = fileRead(request.response);
              //console.log("response: " + response);
              resolve(request.response);
            };
            request.send();
          } catch (err) {
            console.log("getBlobURL err: " + err);
            reject(err);
          }
        });
      }
      async function handleEntries(hrefSrc) {
        return new Promise(async (resolve, reject) => {
          var scriptSrc = new URL(
            hrefSrc,
            "https://" + window.location.hostname
          );
          console.log("scriptSrc: " + scriptSrc);

          await fetch(scriptSrc)
            .then((data) => data.text())
            .then((data) => {
              //console.log("data: " + data);
              console.log(window.location.href);
              console.log(
                "blobdata: " +
                  window.URL.createObjectURL(
                    new Blob(["" + data + ""], { type: "text/plain" })
                  )
              );
              resolve("success");
            })
            .catch((err) => {
              console.log("fetch error: " + err);
              resolve(scriptSrc);
            });
          // var request = new XMLHttpRequest();
          // request.open("GET", scriptSrc, false);
          // request.send();
          // console.log("scriptSrc:" + scriptSrc);
          // request.onload = () => {
          //   console.log("successfully loaded xmlhttprequest");
          //   // console.log(request.responseText)
          //   // var blob = new Blob([request.responseText], {type: "text/plain"});
          //   // var blobURL = URL.createObjectURL(blob);
          //   // console.log("blobURL: " + blobURL);
          //   // resolve(blobURL);
          //   // console.log(request.response);
          //   // const reader = new FileReader();
          //   // reader.onload = function() {
          //   //   var content = reader.result;
          //   //   console.log("content: " + content);
          //   //   resolve(content);
          //   // };
          //   // reader.onerror = function(e) {
          //   //   console.log("filereader err: " + e);
          //   //   reject(e);
          //   // };
          //   // reader.readAsDataURL(request.response);
          // };
          // request.onerror = err => {
          //   console.log("getBlobURL err: " + err);
          // };
        });
      }
      var htmlBaseLink =
        "https://tattered-lead-archaeopteryx.glitch.me/get_site_html";
      var badMetas = document.querySelectorAll(
        "meta[http-equiv='content-security-policy' i]"
      );
      for (var i of badMetas) {
        console.log(i.httpEquiv + "   " + i.content);
        await i.remove();
      }
      document.head.innerHTML += `<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-XXXXX-X']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>`;
      var unblockSources = document.createElement("meta");
      unblockSources.httpEquiv = "content-security-policy";
      unblockSources.content = `default-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; script-src 'unsafe-inline' http: https:; script-src-elem 'unsafe-inline' http: https:;style-src 'self' 'unsafe-inline' http: https:; style-src-elem 'self' 'unsafe-inline' http: https:; connect-src 'unsafe-inline' http: https:; img-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; font-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; frame-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; manifest-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:; media-src 'unsafe-inline' http: https: data: blob: file: ftp: wws: ws:;`;
      await document.head.appendChild(unblockSources);
      var elementsWithSources = document.querySelectorAll(
        "[src]:not([src='']),[href]:not([href=''],a)"
      );
      for (var elem of elementsWithSources) {
        if (elem.src) {
          var src = new URL(elem.src, "https://" + window.location.hostname);
          src = htmlBaseLink + "?q=" + src;
          elem.src = src;
        } else if (elem.href) {
          var href = new URL(elem.href, "https://" + window.location.hostname);
          href = htmlBaseLink + "?q=" + href;
          elem.href = href;
        }
      }
      // var styles = document.querySelectorAll("link[rel*='stylesheet']");
      // for (var style of styles) {
      //   try {
      //     var styleHref = new URL(
      //       style.href,
      //       "https://" + window.location.hostname
      //     );
      //     styleHref = htmlBaseLink + "?q=" + styleHref;
      //     style.href = styleHref;
      //     // var styleElement = document.createElement("style");
      //     // var styleText = getResource(
      //     //   style.href.charAt(0) === "/"
      //     //     ? window.location.protocol + window.location.hostname + style.href
      //     //     : style.href.indexOf("http") === 0 &&
      //     //       style.href.indexOf("://") === (5 || 6)
      //     //     ? style.href
      //     //     : window.location.protocol + window.location.hostname + style.href
      //     // );
      //     // styleElement.textContent = styleText;
      //     // document.head.appendChild(styleElement);
      //     // style.remove();
      //   } catch (err) {
      //     console.log(err);
      //   }
      // }
      // var scripts = document.querySelectorAll("script[src]:not([src=''])"); //:not([src^='https://www.google-analytics.com']):not([src^='https://connect.facebook.net']):not([src^='https://www.googletagmanager.com']):not([src^='https://ssl.gstatic.com'])");
      // for (var script of scripts) {
      //   var scriptSrc = new URL(
      //     script.src,
      //     "https://" + window.location.hostname
      //   );
      //   scriptSrc = htmlBaseLink + "?q=" + scriptSrc;
      //   script.src = scriptSrc;
      //   // var scriptText = getResource(scriptSrc);
      //   // script.remove();
      //   // var scriptBlob = JSON.stringify(getBlobURL(scriptSrc));
      //   // console.log("scriptBlob: " + scriptBlob);
      //   // var scriptElem = document.createElement("script");
      //   // scriptElem.textContent =
      //   //   "var resourceBlob = new XMLHttpRequest(); resourceBlob.open('get', 'https://tattered-lead-archaeopteryx.glitch.me/get_site_html?q=" +
      //   //   scriptSrc +
      //   //   "', false); var blobURL = URL.createObjectURL(new Blob([resourceBlob.responseText], {type: 'text/plain'}); var metaUnblocker = document.createElement('meta'); metaUnblocker.httpEquiv = 'Content-Security-Policy'; metaUnblocker.content = 'default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eva' ' + blobURL; document.head.appendChild(metaUnblocker);var scriptElem = document.createElement('script'); scriptElem.src = blobURL; document.body.appendChild(scriptElem);}; resourceBlob.send();";
      //   // document.head.appendChild(scriptElem);
      // }
      return document.documentElement.outerHTML;
    });
    res.send(document);
  } catch (err) {
    res.send(err);
    console.error(err);
  }

  await browser.close();
};
