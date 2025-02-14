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


  // let titleInnerEl = document.querySelector<HTMLElement>(`.title-wrap-inner-2`);
  // let tEls = document.querySelectorAll(`.works-cluster`);
  // // let offsetAmtY = titleInnerEl!.getBoundingClientRect().height / tEls.length;
  // let titleEls = titleInnerEl!.querySelectorAll('.title-area-2');

  // for (let [i, tEl] of tEls.entries()) {
  //   // console.log('create tirgger', tEl);

  //   ScrollTrigger.create({
  //     trigger: tEl,
  //     // start: 'top center',
  //     // end: 'bottom center',
  //     // Start 10% into the element
  //     start: 'top+=10% center', 
  //     end: 'bottom-=10% center', 
  //     // markers: true,
  //     onToggle: (e) => {
  //       // console.log('onToggle', e, tEl);
        
  //       if (e.isActive) {
  //         // console.log('workAreaActive', i);
  //         // titleInnerEl!.style.transform = `translateY(${i * -69}px)`;
  //         // titleInnerEl!.style.transform = `translateY(${i * -offsetAmtY}px)`;

  //         titleEls.forEach(el => el.classList.remove('active'));
  //         titleEls[i].classList.add('active');
  //       } else {
  //         //
  //       }

  //     },
  //   });
  // } // end for loop

  

  // // if (window.innerWidth <= 767) {
  //   // @ts-expect-error
  //   $('.heading-project').addClass('hidden-down'); // init hidden


  //   let workWrap1Els = document.querySelectorAll(`.work-wrap-lightbox`);
    
  //   // @ts-expect-error
  //   for (let [i, workEl] of workWrap1Els.entries()) {
  //     // console.log('create tirgger', workEl);

  //     // let headEl = workEl.querySelector<HTMLElement>('.heading-project');
  //     // console.log('headEl', headEl);
      

  //     ScrollTrigger.create({
  //       trigger: workEl,

  //       start: 'top-=30px center', 
  //       end: 'bottom+=60px center', 
  //       // start: 'top center', 
  //       // end: 'bottom center', 

  //       // markers: true,

  //       // onToggle: (e) => {
  //       //   // console.log('onToggle', e, tEl);

  //       //   let headEl = workEl.querySelector<HTMLElement>('.heading-project');
          
  //       //   if (e.isActive) {
  //       //     console.log('workActive', i);
  //       //     headEl?.classList.remove('hidden');
  //       //   } else {
  //       //     headEl?.classList.add('hidden');
  //       //   }

  //       // },

  //       onEnter: () => {
  //         workEl.querySelector('.heading-project')?.classList.remove('hidden-down');

  //         // workEl.classList.add('central');
  //       },
  //       onLeave: () => {
  //         workEl.querySelector('.heading-project')?.classList.add('hidden-up');

  //         // workEl.classList.remove('central');
  //       },
  //       onEnterBack: () => {
  //         workEl.querySelector('.heading-project')?.classList.remove('hidden-up');

  //         // workEl.classList.add('central');
  //       },
  //       onLeaveBack: () => {
  //         workEl.querySelector('.heading-project')?.classList.add('hidden-down');

  //         // workEl.classList.remove('central');
  //       }

  //     });
  //   } // end for loop
    
  // // } // end if



  // //

  // let workWrap2Els = document.querySelectorAll(`.work-wrap`);
  // for (let [_i, workEl] of workWrap2Els.entries()) {
  //   // console.log('create tirgger', workEl);
  //   let cTitleEl = workEl.querySelector<HTMLElement>('.work-card-title');
  //   console.log('cTitleEl', cTitleEl);
    

  //   ScrollTrigger.create({
  //     trigger: workEl,
  //     start: 'top-=30px center', 
  //     end: 'bottom+=60px center', 
  //     // markers: true,

  //     onEnter: () => {
  //       workEl.querySelector('.work-card-title')?.classList.remove('hidden-down');
  //     },
  //     onLeave: () => {
  //       workEl.querySelector('.work-card-title')?.classList.add('hidden-up');
  //     },
  //     onEnterBack: () => {
  //       workEl.querySelector('.work-card-title')?.classList.remove('hidden-up');
  //     },
  //     onLeaveBack: () => {
  //       workEl.querySelector('.work-card-title')?.classList.add('hidden-down');
  //     }

  //   });
  // } // end for loop
  

  // give it a sec to init the swipers
  setTimeout(() => {

    // swiper scroller triggers
    let swiperEls = document.querySelectorAll(`.swiper`);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sEl = entry.target;
        const videos = sEl.querySelectorAll<HTMLVideoElement>('.swiper-slide video');
        
        if (entry.isIntersecting) {
          (sEl as any).swiper.autoplay.resume();
          
          // play visible video in stack
          videos[(sEl as any).swiper.activeIndex].play();
          
          sEl.classList.add('central');
        } else {
          (sEl as any).swiper.autoplay.pause();
          
          videos.forEach(video => {
            video.pause();
          });
          
          sEl.classList.remove('central');
        }
      });
    }, {
      threshold: 0.84, // Trigger when at least 90% is visible
      rootMargin: '-60px 0px 0px 0px' // 60px margin from top, 0px for right, bottom, left
    });

    swiperEls.forEach(sEl => {
      observer.observe(sEl);
    });


  }, 1000);


  
}, false);
