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


  let titleInnerEl = document.querySelector<HTMLElement>(`.title-wrap-inner`);
  let tEls = document.querySelectorAll(`.section-gradient`);

  for (let [i, tEl] of tEls.entries()) {
    // console.log('create tirgger', tEl);

    ScrollTrigger.create({
      trigger: tEl,
      // start: 'top center',
      // end: 'bottom center',
      // Start 10% into the element
      start: 'top+=10% center', 
      end: 'bottom-=10% center', 
      markers: true,
      onToggle: (e) => {
        // console.log('onToggle', e, tEl);
        
        if (e.isActive) {
          console.log(i);
          titleInnerEl!.style.transform = `translateY(${i * -69}px)`;
        } else {
          //
        }

      },
    });

  }

  
}, false);
