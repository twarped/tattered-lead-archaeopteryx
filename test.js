var miniget = require("miniget");
var fs = require("graceful-fs");

console.log("oi");

miniget("https://rr2---sn-najern7k.googlevideo.com/videoplayback?expire=1684275420&ei=fKxjZOW6AdKvkwbE14mYBw&ip=107.191.3.4&id=o-ADdcjZvYsLDaqUVdn1paqQhi80h25tLT9Cx5ly-VyryP&itag=22&source=youtube&requiressl=yes&vprv=1&svpuc=1&mime=video%2Fmp4&ns=tP-WQ0Ewf_M_ZoR7Jz7S_vEN&cnr=14&ratebypass=yes&dur=1781.504&lmt=1632175227835404&fexp=24007246,24350018&beids=24350018&c=WEB&txp=5532434&n=7jgPyH1Bbf67aw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Csvpuc%2Cmime%2Cns%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRQIgEZCwJUKeqDRnN87YxZkJbLwVHf1BYbSRfzZzsTmdx04CIQDvmAT7sHqUAu1tSuPwGprPUztlUnnteLnUcr9qGVemiw%3D%3D&rm=sn-o09sl7e&req_id=2b03e02b8eba3ee&ipbypass=yes&redirect_counter=2&cm2rm=sn-0u5ixqoxu-najl7l&cms_redirect=yes&cmsv=e&mh=aX&mip=204.113.155.3&mm=29&mn=sn-najern7k&ms=rdu&mt=1684253599&mv=m&mvi=2&pl=16&lsparams=ipbypass,mh,mip,mm,mn,ms,mv,mvi,pl&lsig=AG3C_xAwRgIhAIHt-c0NnQWR6vE0cbUl-YjqZk8nVrmmWAnsjNm6b7FVAiEA2GOYimCkOlwvNxwCNWKgcPqqC5_wUaYbMo9g3DadMCM%3D").on("response", response => {
    console.log(response);
});