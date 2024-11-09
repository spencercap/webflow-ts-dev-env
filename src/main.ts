// function skeeter() {
// 	console.log('skeet');
// }

// (window as any).skeeter = skeeter;


import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { GUI } from 'dat.gui';


const params = {
	a: 3,
	b: 2,
	c: 1,
	delta: Math.PI / 2,
	A: 5,
	B: 5,
	C: 5,
	tubeRadius: 0.2,
	radialSegments: 8,
	// color: 0xff0000,
	color: 0xc3ff03,
	pixelSize: 10, // Pixel size for shader
	bloomStrength: 1.5,
	bloomRadius: 0.4,
	bloomThreshold: 0,
	exposure: 1,
	backgroundColor: 0x000000,
	grainAmount: 0.08,
	grainSpeed: 1.0,
};

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = params.exposure;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add after scene initialization and before the Lissajous curve code
// Create SVG texture
const svgMarkup = `<svg width="100%" height="100%" viewBox="0 0 349 121" xmlns="http://www.w3.org/2000/svg">

<clipPath id="svgTextPath">
<path d="M166.492 0.152327H130.998L128.251 0.840872C125.656 1.55462 123.273 2.88884 121.306 4.7283C119.338 6.56777 117.845 8.85767 116.953 11.4026C111.305 26.7094 105.58 41.4807 99.9318 56.5579C92.2987 77.5283 84.6655 98.4218 76.4218 119.392V120.387H103.901C104.194 120.432 104.493 120.362 104.735 120.191C104.977 120.02 105.143 119.76 105.199 119.469L128.098 58.2415C128.158 57.9564 128.278 57.6874 128.449 57.452C128.62 57.2166 128.839 57.0201 129.092 56.8756C129.344 56.731 129.624 56.6424 129.913 56.614C130.202 56.5856 130.494 56.6185 130.769 56.7111C131.032 56.8184 131.269 56.9786 131.467 57.182C131.665 57.3854 131.819 57.6272 131.919 57.893C132.019 58.1587 132.064 58.4425 132.05 58.7263C132.036 59.0101 131.964 59.2883 131.838 59.5429C129.93 64.6707 128.021 69.7219 126.19 74.8497C122.602 84.3399 119.091 93.83 115.579 103.397C115.554 103.702 115.554 104.01 115.579 104.315L120.236 103.856L156.187 100.106C156.975 99.9435 157.796 100.091 158.478 100.518C159.16 100.946 159.652 101.62 159.851 102.402C161.988 108.295 164.126 114.189 166.187 120.158C166.187 120.847 166.721 121 167.408 121H179.239V17.8322C179.315 14.6554 178.717 11.4982 177.484 8.57089C176.706 6.22359 175.242 4.16509 173.281 2.6636C171.321 1.16212 168.956 0.28735 166.492 0.152327Z" fill="#ffffff"></path>
<path d="M262.058 65.054C261.59 63.6282 260.76 62.3496 259.649 61.3431C258.538 60.3367 257.185 59.6371 255.723 59.3139C253.847 58.9336 251.897 59.2328 250.22 60.1576C248.543 61.0824 247.248 62.5733 246.563 64.3654C246.029 65.6665 245.571 66.9678 245.037 68.3454C244.502 69.723 243.434 70.4115 242.289 69.9523C241.144 69.4931 240.686 68.3449 241.22 66.8907L257.479 23.1901C258.371 20.9895 258.787 18.6234 258.699 16.2495C258.61 13.8755 258.02 11.5478 256.966 9.42009C255.912 7.2924 254.419 5.41422 252.586 3.90892C250.753 2.40362 248.622 1.30535 246.334 0.688545C245.342 0.688545 244.35 0.229602 243.281 0H197.483L194.048 0.688545C190.533 1.61174 187.428 3.68911 185.229 6.58836C183.029 9.48761 181.861 13.0423 181.911 16.6848V120.159H206.337C206.61 120.204 206.889 120.141 207.117 119.984C207.345 119.827 207.503 119.588 207.558 119.316C215.14 98.9073 222.773 78.4982 230.457 58.0891V57.4772C230.542 57.2224 230.678 56.9876 230.857 56.7868C231.035 56.586 231.252 56.4238 231.494 56.3094C231.737 56.1949 232 56.1303 232.268 56.1207C232.536 56.111 232.803 56.1558 233.053 56.2524C233.309 56.3447 233.545 56.4891 233.743 56.6765C233.942 56.864 234.1 57.0904 234.207 57.3417C234.315 57.5931 234.369 57.8642 234.367 58.1377C234.366 58.4112 234.308 58.6818 234.198 58.9318L228.931 72.9372C225.42 82.4275 221.909 91.8408 218.474 101.254C218.308 101.57 218.179 101.904 218.092 102.249L223.282 101.714L239.159 100.031L248.548 98.959C249.489 98.7277 250.483 98.8793 251.313 99.3813C252.143 99.8833 252.74 100.695 252.975 101.638L259.387 119.699C259.387 120.235 259.387 120.465 260.379 120.465H285.11L284.652 119.47L262.058 65.054Z" fill="#ffffff"></path>
<path d="M89.5509 55.7931H70.239C69.9384 55.769 69.6396 55.857 69.4 56.0407C69.1604 56.2244 68.9971 56.4908 68.9415 56.7881L53.0646 100.03C52.454 101.714 51.4617 102.326 50.2404 101.867C49.0191 101.408 48.7139 100.412 49.4009 98.652L64.667 57.4766C65.1846 55.8782 66.2123 54.495 67.5919 53.5406C68.9714 52.5862 70.6261 52.1141 72.3001 52.1962H78.8644C79.7563 52.3003 80.6561 52.0789 81.3989 51.5731C82.1416 51.0672 82.678 50.3098 82.9102 49.4402C86.1924 40.7153 89.4744 31.9144 92.6803 23.1895C93.5893 20.692 93.8927 18.0137 93.5655 15.3754C93.2382 12.7371 92.29 10.2145 90.7986 8.01627C89.3072 5.81806 87.3153 4.0072 84.9881 2.73306C82.6608 1.45891 80.0648 0.757535 77.4141 0.687977C65.3539 0.687977 53.2173 0.687977 41.157 0.687977C37.7379 0.650561 34.391 1.6757 31.5756 3.62154C28.7603 5.56737 26.6145 8.33886 25.4329 11.5562C17.291 32.8326 9.17447 54.1344 1.08341 75.4619C-0.361137 79.0987 -0.361137 83.1521 1.08341 86.7888L9.55601 109.749C10.6775 113.054 12.8231 115.913 15.6791 117.91C18.5352 119.906 21.9525 120.935 25.4329 120.847H70.4683C70.7704 120.894 71.079 120.826 71.3334 120.656C71.5878 120.486 71.7693 120.226 71.8421 119.929C79.0172 100.566 86.1925 81.6611 93.4439 61.9153C94.101 61.3364 94.5298 60.5414 94.6528 59.673C94.7759 58.8047 94.585 57.921 94.1148 57.1814C93.6445 56.4418 92.9261 55.8954 92.0891 55.6408C91.252 55.3862 90.3517 55.4401 89.5509 55.7931Z" fill="#ffffff"></path>
<path d="M323.81 94.2139C321.825 94.2139 320.909 92.9126 321.596 91.0758L339.076 44.0071C341.824 36.3537 344.648 29.3891 347.167 21.9653C347.885 19.7757 348.143 17.461 347.924 15.1667C347.705 12.8724 347.014 10.6487 345.895 8.63531C344.776 6.62194 343.254 4.86286 341.423 3.46889C339.593 2.07491 337.494 1.0765 335.26 0.536262L332.588 0H331.672C331.061 1.91335 330.374 3.75002 329.687 5.58684C322.054 26.4041 314.421 47.1451 306.788 67.9623C306.821 68.1136 306.821 68.2707 306.788 68.422C306.733 68.7063 306.618 68.9748 306.449 69.2096C306.28 69.4443 306.061 69.6398 305.809 69.7813C305.558 69.9229 305.278 70.0069 304.99 70.0289C304.702 70.0509 304.413 70.01 304.143 69.9084C303.872 69.8067 303.627 69.6467 303.425 69.4403C303.222 69.2339 303.067 68.9862 302.97 68.7135C302.873 68.4407 302.837 68.1497 302.863 67.8614C302.89 67.5731 302.979 67.2942 303.124 67.044C304.956 61.9162 306.941 56.7884 308.849 51.7371C315.108 34.7976 321.393 17.9091 327.703 1.07159V0.0766089H279.92C276.889 0.40804 274.015 1.59953 271.635 3.51093C269.256 5.42233 267.469 7.97462 266.485 10.8682C264.806 15.2306 263.203 19.6695 261.524 24.1084C260.302 27.3994 258.852 30.7664 257.86 34.1339C256.756 38.3156 257.133 42.7521 258.929 46.6856C262.974 56.6351 267.172 66.508 271.294 76.3809L287.476 115.108C288.092 116.623 289.151 117.917 290.513 118.818C291.875 119.72 293.478 120.187 295.109 120.159H348.541V93.9841H347.549L323.81 94.2139Z" fill="#ffffff"></path>
</clipPath>
</svg>`;

const loader = new SVGLoader();
const svgData = loader.parse(svgMarkup);

// Create a group to hold the SVG paths
const svgGroup = new THREE.Group();
svgData.paths.forEach((path) => {
	const shapes = path.toShapes(true);
	shapes.forEach((shape) => {
		const geometry = new THREE.ShapeGeometry(shape);
		const material = new THREE.MeshPhysicalMaterial({
			color: path.color,
			metalness: 0.0,
			roughness: 0.8,
			transmission: 0.9,
			thickness: 1.0,      // Added back thickness
			ior: 1.5,           // Index of refraction (glass = 1.5)
			transparent: true,
			opacity: 0.7,
			envMapIntensity: 1,
			clearcoat: 1.0,
			clearcoatRoughness: 0.75,
		});
		const mesh = new THREE.Mesh(geometry, material);
		svgGroup.add(mesh);
	});
	// shapes.forEach((shape) => {
	// 	const geometry = new THREE.ShapeGeometry(shape);
	// 	const material = new THREE.MeshPhysicalMaterial({
	// 		color: path.color,
	// 		metalness: 0.0,
	// 		roughness: 0.4,        // Increased from 0.1 to 0.4 for more blur
	// 		transmission: 0.9,     // Keep high transmission for transparency
	// 		transparent: true,
	// 		opacity: 0.7,         // Increased from 0.1 to 0.5 for more visible effect
	// 		envMapIntensity: 1,
	// 		clearcoat: 1.0,
	// 		clearcoatRoughness: 0.75, // Increased from 0.1 to 0.5 for more blur
	// 	});
	// 	const mesh = new THREE.Mesh(geometry, material);
	// 	svgGroup.add(mesh);
	// });
});

// Add environment map for better glass effect
const pmremGenerator = new THREE.PMREMGenerator(renderer);

scene.environment = pmremGenerator.fromScene(new THREE.Scene()).texture;

// Center the SVG geometry
const box = new THREE.Box3().setFromObject(svgGroup);
const center = box.getCenter(new THREE.Vector3());

svgGroup.position.sub(center);

// Scale and position the SVG
svgGroup.scale.set(0.05, -0.05, 0.05); // Adjust scale as needed
svgGroup.position.set(-9, 3, 0); // Center position
scene.add(svgGroup);


// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// OrbitControls for interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls;

// Set the initial background color of the scene
scene.background = new THREE.Color(params.backgroundColor);

// Variable to store the mesh
let tubeMesh: THREE.Mesh<THREE.TubeGeometry>;
// let tubeMesh: THREE.Mesh<any>;

// Function to create/update the Lissajous curve
function createLissajousCurve() {
	if (tubeMesh) {
		scene.remove(tubeMesh);
		tubeMesh.geometry.dispose();
		if (Array.isArray(tubeMesh.material)) {
			tubeMesh.material.forEach(m => m.dispose());
		} else {
			tubeMesh.material.dispose();
		}
		tubeMesh = undefined as any; // reset
	}

	const points = [];
	for (let t = 0; t <= 2 * Math.PI; t += 0.01) {
		const x = params.A * Math.sin(params.a * t + params.delta);
		const y = params.B * Math.sin(params.b * t);
		const z = params.C * Math.sin(params.c * t);
		points.push(new THREE.Vector3(x, y, z));
	}

	const curve = new THREE.CatmullRomCurve3(points);
	const geometry = new THREE.TubeGeometry(
		curve,
		400,
		params.tubeRadius,
		params.radialSegments,
		false
	);

	const material = new THREE.MeshPhongMaterial({
		color: params.color,
		side: THREE.DoubleSide,
	});

	tubeMesh = new THREE.Mesh(geometry, material);
	scene.add(tubeMesh);
}

createLissajousCurve();

// Set camera position
camera.position.z = 15;

// Create the pixelation shader
const PixelationShader = {
	uniforms: {
		tDiffuse: { value: null }, // The rendered scene
		resolution: { value: new THREE.Vector2() }, // Screen resolution
		pixelSize: { value: params.pixelSize }, // Pixel size for effect
	},
	vertexShader: `
							varying vec2 vUv;
							void main() {
									vUv = uv;
									gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
							}
					`,
	fragmentShader: `
							uniform sampler2D tDiffuse;
							uniform vec2 resolution;
							uniform float pixelSize;

							varying vec2 vUv;

							void main() {
									vec2 dxy = pixelSize / resolution;
									vec2 coord = dxy * floor(vUv / dxy);
									gl_FragColor = texture2D(tDiffuse, coord);
							}
					`,
};

// Set up postprocessing with EffectComposer
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Pixelation ShaderPass
const pixelPass = new ShaderPass(PixelationShader);
pixelPass.uniforms['resolution'].value.set(
	window.innerWidth,
	window.innerHeight
);
composer.addPass(pixelPass);

// Unreal Bloom Pass (Bloom effect)
const bloomPass = new UnrealBloomPass(
	new THREE.Vector2(window.innerWidth, window.innerHeight),
	params.bloomStrength,
	params.bloomRadius,
	params.bloomThreshold
);
composer.addPass(bloomPass);

// Add this after your existing shader definitions
const GrainShader = {
	uniforms: {
		tDiffuse: { value: null },
		amount: { value: 0.08 },
		speed: { value: 1.0 },
		time: { value: 0 }
	},
	vertexShader: `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
	fragmentShader: `
uniform sampler2D tDiffuse;
uniform float amount;
uniform float speed;
uniform float time;
varying vec2 vUv;

float random(vec2 co) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	vec4 color = texture2D(tDiffuse, vUv);
	vec2 uvRandom = vUv;
	uvRandom.y *= random(vec2(uvRandom.y, time * speed));
	color.rgb += amount * (random(uvRandom) - 0.5);
	gl_FragColor = color;
}
`
};

// Add grain parameters to your existing params object
params.grainAmount = 0.08;
params.grainSpeed = 1.0;

// Create and add the grain pass after your existing passes
const grainPass = new ShaderPass(GrainShader);
composer.addPass(grainPass);

// Update the animation loop to include time for the grain effect
let time = 0;
function animate() {
	requestAnimationFrame(animate);
	time += 0.01;
	grainPass.uniforms.time.value = time;

	tubeMesh.rotation.x += 0.005;
	tubeMesh.rotation.y += 0.01;

	// Render the scene with post-processing
	composer.render();
}

// Animation loop
animate();


// GUI for interactive parameters
const parentElement = document.querySelector('.bodyreal'); // Your parent element
// console.log('parentElement', parentElement);
const gui = new GUI();
const guiElement = gui.domElement;
guiElement.style.zIndex = '9999'; // Set to your desired z-index
guiElement.style.position = 'fixed';
guiElement.style.top = '50px';
guiElement.style.right = '0px';
parentElement!.appendChild(gui.domElement);

gui.add(params, 'a', 1, 10, 1).onChange(createLissajousCurve);
gui.add(params, 'b', 1, 10, 1).onChange(createLissajousCurve);
gui.add(params, 'c', 1, 10, 1).onChange(createLissajousCurve);
gui.add(params, 'A', 1, 10).onChange(createLissajousCurve);
gui.add(params, 'B', 1, 10).onChange(createLissajousCurve);
gui.add(params, 'C', 1, 10).onChange(createLissajousCurve);
gui.add(params, 'tubeRadius', 0.05, 1).step(0.01).onChange(createLissajousCurve);
gui.add(params, 'radialSegments', 3, 20, 1).onChange(createLissajousCurve);
gui.addColor(params, 'color').onChange(createLissajousCurve);
gui.add(params, 'pixelSize', 1, 50).onChange(function (value) {
	pixelPass.uniforms['pixelSize'].value = value;
}).name('Pixel Size');

// Add bloom controls
gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
	bloomPass.strength = value;
}).name('Bloom Strength');
gui.add(params, 'bloomRadius', 0.0, 1.0).onChange(function (value) {
	bloomPass.radius = value;
}).name('Bloom Radius');
gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
	bloomPass.threshold = value;
}).name('Bloom Threshold');

gui.add(params, 'exposure', 0.1, 2).onChange(function (value) {
	renderer.toneMappingExposure = value;

	// prev
	// renderer.toneMappingExposure = value;
	// // Update composer's exposure as well
	// composer.passes.forEach(pass => {
	// 	if (pass instanceof RenderPass) {
	// 		pass.toneMappingExposure = value;
	// 	}
	// });
}).name('Exposure');

gui.addColor(params, 'backgroundColor').onChange(function (value) {
	// rough typing...
	(scene as any).background.set(value);
}).name('BG Color');

// Add grain controls to GUI
gui.add(params, 'grainAmount', 0, 0.5).onChange(function (value) {
	grainPass.uniforms.amount.value = value;
}).name('Grain Amount');

gui.add(params, 'grainSpeed', 0, 5).onChange(function (value) {
	grainPass.uniforms.speed.value = value;
}).name('Grain Speed');

// Handle window resize
window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	pixelPass.uniforms['resolution'].value.set(
		window.innerWidth,
		window.innerHeight
	);
	bloomPass.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
});


window.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded');


}, false);
