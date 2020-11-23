var downloadbutton = document.getElementById("downloadbutton")
downloadbutton.addEventListener("click",()=>{
  var url = document.getElementById("yturl").value
  alert((url.value != "" ? url.value : "nope, fill out the thingy..."))
  window.open(window.location+"download?url="+url)
})