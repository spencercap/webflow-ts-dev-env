const dialogElem = document.getElementById("dialogReel");
const showBtn = document.querySelector(".cta-reel-trigger");

// https://player.vimeo.com/video/992393276?h=b1e3c7fc28&autoplay=1&muted=1

let vimeoPlayer = null;
var vIframe = document.getElementById('vimeoIframeReel');
vimeoPlayer = new Vimeo.Player(vIframe);
// console.log('vimeoPlayer', vimeoPlayer);

// console.log('do pause');
vimeoPlayer.pause();
    
showBtn.addEventListener("click", () => {
	dialogElem.showModal();
  
  // video
  console.log('do play');
  vimeoPlayer.play();
  vimeoPlayer.setVolume(1);
});

dialogElem.addEventListener('click', function(event) {
    var rect = dialogElem.getBoundingClientRect();
    var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
      
    if (!isInDialog) {
      vimeoPlayer.pause();

      dialogElem.close();
    }
});