//

function skeeter() {
  console.log('skeet');
}

(window as any).skeeter = skeeter;

import gsap from 'gsap'
import ScrollTrigger from "gsap/ScrollTrigger"; // nice! modular

gsap.registerPlugin(ScrollTrigger);

import 'https://cdn.jsdelivr.net/npm/@theatre/browser-bundles@0.7.2/dist/core-and-studio.js';

const { core, studio } = (window as any).Theatre;

//document.addEventListener("DOMContentLoaded", async () => {
    console.log('theatre js started');

     // 🟢 Initialize Theatre.js Studio
    studio.initialize();

    // 🟢 Initialize Theatre.js
    const project = core.getProject("ScrollSyncProject");
    const sheet = project.sheet("ScrollAnimation");

    // 🟢 Select elements
    const scroller = document.querySelector(".scroller")!;
    const box = document.querySelector(".box");
    console.log('box', box);

    // 🟢 Create Theatre.js animation object
    const obj = sheet.object("Box Position", {
        x: core.types.number(0, { range: [0, 800] }),
        y: core.types.number(0, { range: [0, 800] }),
    });

    // 🟢 Sync box position with Theatre.js animation
    obj.onValuesChange((tVals: any) => {
        console.log('vals changed', tVals);
        //console.log('box', box);
        
        /*
        //let newT = `translate(${values.x}px, ${values.y}px)`;
        let newT = 'translate(' + values.x + 'px, ' + values.y + 'px)';
        console.log('newT', newT);

        //box.style.transform = `translate(${values.x}px, ${values.y}px)`;
        box.style.transform = newT;

        let x = values.x ?? 0; // Default to 0 if null or undefined
        let y = values.y ?? 0;

        */

        // Destructure values with default fallback
        const { x = 0, y = 0 } = tVals; // If x or y is null/undefined, default to 0

        // Update CSS custom properties at the document root level
        
        // template strings work when using script src but not divhunt embed area
        document.documentElement.style.setProperty('--box-x', `${x}px`);
        document.documentElement.style.setProperty('--box-y', `${y}px`);

        // document.documentElement.style.setProperty('--box-x', x + 'px');
        // document.documentElement.style.setProperty('--box-y', y + 'px');

        //let newT = `translate(${x}px, ${y}px)`;
        //let newT = 'translate(' + tVals.x + 'px, ' + tVals.y + 'px)';
        //console.log('newT', newT);

        //box.style.transform = newT;
    });

    // 🟢 Scroll-based animation sequence control
    const sequenceLength = 3; // Adjust based on animation duration
    function updateScroll() {
        const scrollOffset = scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight);
        sheet.sequence.position = scrollOffset * sequenceLength;
        requestAnimationFrame(updateScroll);
    }

    // 🟢 Start syncing scroll with animation
    updateScroll();
//});
