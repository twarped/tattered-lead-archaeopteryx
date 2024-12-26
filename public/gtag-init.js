let userId = localStorage.getItem("uid");
if (userId == null) {
  userId = Math.random().toString();
  localStorage.setItem("uid", userId);
}

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());

gtag("config", "G-NE3TXVVDY4", {
  user_id: userId,
});
