var url = document.querySelector("#yt-url").value
var downloadbutton = document.querySelector("#download-button")
downloadbutton.addEventListener("click",()=>{
  alert(url)
  window.location = window.location+"download?url="+url
})