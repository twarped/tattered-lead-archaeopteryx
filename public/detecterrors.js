window.onerror = function(msg, url, lineNo, columnNo, error) {
  var errorWindow = window.open("", "", "");
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
      error
  );
};
