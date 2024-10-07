//

function skeeter() {
  console.log('skeet');
}

(window as any).skeeter = skeeter;

import gsap from 'gsap'
import ScrollTrigger from "gsap/ScrollTrigger"; // nice! modular

gsap.registerPlugin(ScrollTrigger);

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');


  // gsap.to('.') // woo, gsap autocomplete



  // jquery way...
  // ($ as any)('.trigger-areas').each((index: ) => {

  // })



  let tEls = document.querySelectorAll('.trigger-area');
  for (let tEl of tEls) {
    console.log('create tirgger', tEl);

    ScrollTrigger.create({
      trigger: tEl,
      start: 'top center',
      end: 'bottom center',
      markers: true,
    });

  }

  
}, false);
