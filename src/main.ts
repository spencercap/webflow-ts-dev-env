//

function skeeter() {
	console.log('skeet');
}

(window as any).skeeter = skeeter;

import gsap from 'gsap'
import ScrollTrigger from "gsap/ScrollTrigger"; // nice! modular

console.log('gsap', gsap);
console.log('ScrollTrigger', ScrollTrigger);

gsap.registerPlugin(ScrollTrigger);

window.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded');
	
	
}, false);
