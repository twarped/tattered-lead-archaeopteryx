window.onerror = function(msg, url, lineNo, columnNo, error) {
  var xhr = new XMLHttpRequest();
  xhr.onload = () => {
    var errorWindow = window.open("", "", "");
    errorWindow.document.write("<body></body>");
    errorWindow.document.write(
      // "Message: " +
      // msg +
      // "<br>URL/Script: " +
      // url +
      // "<br>Line Number: " +
      // lineNo +
      // "<br>Column/Char Number: " +
      // columnNo +
      // "<br>Error: " +
      // error +
      // "<br>(Beta) Line and text: " +
      xhr.response.replaceAll("<", "&lt;").replaceAll(">", "&gt;").split("\n")[lineNo - 1]
    )
  };
  xhr.open("get", url);
  xhr.send();
};
