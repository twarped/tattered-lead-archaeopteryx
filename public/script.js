var downloadbutton = document.getElementById("downloadbutton")
downloadbutton.addEventListener("click",()=>{
  var url = document.getElementById("yturl").value
  alert((url != "" ? url : "nope, fill out the thingy..."))
  if (url != "") window.open(window.location+"download?url="+url)
})