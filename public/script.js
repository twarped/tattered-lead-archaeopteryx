var downloadbutton = document.getElementById("downloadbutton")
downloadbutton.addEventListener("click",()=>{
  var url = document.getElementById("yturl").value
  alert(url)
  window.open(window.location+"download?url="+url)
})