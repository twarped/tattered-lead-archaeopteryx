window.onerror = function(msg, url, lineNo, columnNo, error) {
  var xhr = new XMLHttpRequest();
  xhr.onload = () => {
    var errorWindow = window.open("", "", "");
    errorWindow.document.write("<body></body>");
    errorWindow.document.body.textContent =
      "Message: " +
      msg +
      "<br>URL/Script: " +
      url +
      "<br>Line Number: " +
      lineNo +
      "<br>Column/Char Number: " +
      columnNo +
      "<br>Error: " +
      error +
      "(Beta) Line and text: " +
      JSON.stringify(xhr.response);
  };
  xhr.open("get", url);
  xhr.send();
};
