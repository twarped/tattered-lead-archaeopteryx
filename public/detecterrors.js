window.onerror = function(msg, url, lineNo, columnNo, error) {
  var xhr = new XMLHttpRequest();
  xhr.onload = () => {
    var data = xhr.responseText;
    data[columnNo - 1] = ".....start of bad stuff: " + data[columnNo - 1];
    data = data.join("");
    var errorWindow = window.open("", "", "");
    errorWindow.document.write("<body></body>");
    errorWindow.document.write(
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
        "<br>(Beta) Line and text: " +
        data
    );
  };
  xhr.open("get", url);
  xhr.send();
};