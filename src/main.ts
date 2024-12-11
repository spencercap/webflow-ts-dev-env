import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x222222);  // Dark grey
document.body.appendChild(renderer.domElement);

// Add at the top with other constants
const CUBE_COUNT = 56;
const SPIRAL_ORBITS = 3;  // Controls how many times the spiral goes around
const cubes: THREE.Mesh[] = [];

// Add a function to calculate spiral position
function getSpiralPosition(index: number) {
    const angle = (index / CUBE_COUNT) * Math.PI * 2 * SPIRAL_ORBITS;
    const baseRadius = 12;
    const height = index * 0.5;
    
    // Increase radius based on height
    const radiusMultiplier = 1 + (height / (CUBE_COUNT * 0.5)) * 0.8;  // 0.8 controls expansion rate
    const radius = baseRadius * radiusMultiplier;
    
    return {
        x: Math.cos(angle) * radius,
        y: height - (CUBE_COUNT * 0.25),
        z: Math.sin(angle) * radius
    };
}

// After creating cubes, create a group to hold them all
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

// Move cubes into the group (update cube creation loop)
for (let i = 0; i < CUBE_COUNT; i++) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x6BD58D });
    const cube = new THREE.Mesh(geometry, material);
    const pos = getSpiralPosition(i);
    cube.position.set(pos.x, pos.y, pos.z);
    cubeGroup.add(cube);  // Add to group instead of scene
}

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1.6);  // Dimmer ambient
scene.add(ambientLight);

// Main directional light
const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
mainLight.position.set(10, 10, 10);
scene.add(mainLight);

// Add accent light with slight blue tint for contrast
const accentLight = new THREE.DirectionalLight(0x7AB8FF, 0.8);
accentLight.position.set(-15, 5, -15);
scene.add(accentLight);

// Add subtle rim light
const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(0, -10, 0);
scene.add(rimLight);

// Set camera position
camera.position.set(15, 10, 15);
camera.lookAt(0, 0, 0);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// At the top with other initializations
const tweenGroup = new TWEEN.Group();

function createRandomRotation(cube: THREE.Mesh, currentIndex: number) {
    const nextIndex = (currentIndex + 1) % CUBE_COUNT;
    
    // Only animate alternate cubes
    if (currentIndex % 2 === 0) {
        const axes = ['x', 'y', 'z'] as const;
        const randomAxis = axes[Math.floor(Math.random() * axes.length)] as keyof THREE.Euler;
        const targetRotation = (cube as any).rotation[randomAxis] + Math.PI / 2;
        
        // Apply both rotation and jump animations
        const currentY = cube.position.y;
        new TWEEN.Tween(cube.position, tweenGroup)
            .to({ y: currentY + 1 }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .chain(
                new TWEEN.Tween(cube.position, tweenGroup)
                    .to({ y: currentY }, 500)
                    .easing(TWEEN.Easing.Quadratic.In)
            )
            .start();
            
        new TWEEN.Tween(cube.rotation, tweenGroup)
            .to({ [randomAxis]: targetRotation }, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }
    
    // Schedule next animation
    setTimeout(() => createRandomRotation(cube, nextIndex), 1100);
}

// Start animations with initial indices
cubeGroup.children.forEach((cube, index) => createRandomRotation(cube, index));

// Update animation loop
function animate() {
    requestAnimationFrame(animate);
    
    cubeGroup.rotation.y -= 0.002;  // Subtle spin
    
    tweenGroup.update();
    controls.update();
    renderer.render(scene, camera);
}

animate();
