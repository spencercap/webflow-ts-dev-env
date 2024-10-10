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
  let tEls = document.querySelectorAll(`.works-cluster`);
  let offsetAmtY = titleInnerEl!.getBoundingClientRect().height / tEls.length;

  for (let [i, tEl] of tEls.entries()) {
    // console.log('create tirgger', tEl);

    ScrollTrigger.create({
      trigger: tEl,
      // start: 'top center',
      // end: 'bottom center',
      // Start 10% into the element
      start: 'top+=10% center', 
      end: 'bottom-=10% center', 
      // markers: true,
      onToggle: (e) => {
        // console.log('onToggle', e, tEl);
        
        if (e.isActive) {
          // console.log('workAreaActive', i);
          // titleInnerEl!.style.transform = `translateY(${i * -69}px)`;
          titleInnerEl!.style.transform = `translateY(${i * -offsetAmtY}px)`;
        } else {
          //
        }

      },
    });
  } // end for loop

  

  if (window.innerWidth <= 767) {
    // @ts-expect-error
    $('.heading-project').addClass('hidden-down'); // init hidden


    let workEls = document.querySelectorAll(`.work-wrap-lightbox`);
    
    // @ts-expect-error
    for (let [i, workEl] of workEls.entries()) {
      // console.log('create tirgger', tEl);

      ScrollTrigger.create({
        trigger: workEl,

        start: 'top-=30px center', 
        end: 'bottom+=60px center', 
        // start: 'top center', 
        // end: 'bottom center', 

        // markers: true,

        // onToggle: (e) => {
        //   // console.log('onToggle', e, tEl);

        //   let headEl = workEl.querySelector<HTMLElement>('.heading-project');
          
        //   if (e.isActive) {
        //     console.log('workActive', i);
        //     headEl?.classList.remove('hidden');
        //   } else {
        //     headEl?.classList.add('hidden');
        //   }

        // },

        onEnter: () => {
          workEl.querySelector('.heading-project')?.classList.remove('hidden-down');
        },
        onLeave: () => {
          workEl.querySelector('.heading-project')?.classList.add('hidden-up');
        },
        onEnterBack: () => {
          workEl.querySelector('.heading-project')?.classList.remove('hidden-up');
        },
        onLeaveBack: () => {
          workEl.querySelector('.heading-project')?.classList.add('hidden-down');
        }

      });
    } // end for loop
    
  }


  
}, false);
