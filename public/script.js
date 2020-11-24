var downloadbutton = document.getElementById("downloadbutton")
downloadbutton.addEventListener("click",()=>{
  var url = document.getElementById("yturl").value
  var urlchecker=/youtube\.com\/watch(\?|&)v=[a-zA-Z0-9]+/g
  alert((url.match(urlchecker) ? url : "Type In a Correct Youtube URL"))
  if (url.match(urlchecker)) window.open(window.location+"download?url="+url)
})