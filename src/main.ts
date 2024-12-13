import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x222222);  // Slightly lighter grey
document.body.appendChild(renderer.domElement);

// Add at the top with other constants
const CUBE_COUNT = 256;
const SPIRAL_ORBITS = 13;  // Controls how many times the spiral goes around
const SPIRAL_EXPANSION_RATIO = 10;  // Controls how much the spiral expands with height
// const cubes: THREE.Mesh[] = [];

// Add a function to calculate spiral position
function getSpiralPosition(index: number) {
    const angle = (index / CUBE_COUNT) * Math.PI * 2 * SPIRAL_ORBITS;
    const baseRadius = 12;
    const height = index * 1.75;
    
    // Increase radius based on height using the constant
    const radiusMultiplier = 1 + (height / (CUBE_COUNT * 0.5)) * SPIRAL_EXPANSION_RATIO;
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
	const cubeSize = 2.4;
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x19EC43,  // Halfway between 0x00FF00 and 0x31D886
        emissive: new THREE.Color(0x19EC43).multiplyScalar(0.2),
        shininess: 100
    });
    const cube = new THREE.Mesh(geometry, material);
    const pos = getSpiralPosition(i);
    cube.position.set(pos.x, pos.y, pos.z);
    
    // Scale cubes based on height
    const normalizedHeight = (pos.y + (CUBE_COUNT * 0.25)) / (CUBE_COUNT * 1.75); // Normalize height to 0-1
    const scaleMultiplier = 1 + (normalizedHeight * 2.5); // Scale up to 2.5x larger
    cube.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
    
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
camera.position.set(15, -50, 140);
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
        
        // Define brighter colors
        const baseColor = new THREE.Color(0x19EC43);
        const activeColor = new THREE.Color(0x19EC43).multiplyScalar(2);
        
        const material = (cube as THREE.Mesh).material as THREE.MeshPhongMaterial;
        material.emissive.copy(baseColor).multiplyScalar(0.2);
        
        // Color animation remains the same
        new TWEEN.Tween(material.color, tweenGroup)
            .to(activeColor, 200)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                material.emissive.copy(material.color).multiplyScalar(0.3);
            })
            .chain(
                new TWEEN.Tween(material.color, tweenGroup)
                    .to(baseColor, 600)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(() => {
                        material.emissive.copy(material.color).multiplyScalar(0.2);
                    })
            )
            .start();
        
        // Calculate height-based jump
        const currentY = cube.position.y;
        const normalizedHeight = (currentY + (CUBE_COUNT * 0.25)) / (CUBE_COUNT * 1.75); // Normalize height to 0-1
        const baseJumpHeight = 0.75 + Math.random() * 0.5;
        const heightMultiplier = 1 + (normalizedHeight * 2); // Higher cubes jump up to 3x more
        const jumpHeight = baseJumpHeight * heightMultiplier;
        
        const jumpDuration = 400 + Math.random() * 200;
        
        // Position and rotation animations
        new TWEEN.Tween(cube.position, tweenGroup)
            .to({ y: currentY + jumpHeight }, jumpDuration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .chain(
                new TWEEN.Tween(cube.position, tweenGroup)
                    .to({ y: currentY }, jumpDuration)
                    .easing(TWEEN.Easing.Quadratic.In)
            )
            .start();
            
        new TWEEN.Tween(cube.rotation, tweenGroup)
            .to({ [randomAxis]: targetRotation }, jumpDuration * 0.8)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }
    
    const nextDelay = 1000 + Math.random() * 200;
    setTimeout(() => createRandomRotation(cube, nextIndex), nextDelay);
}

// Start animations with initial indices
cubeGroup.children.forEach((cube, index) => createRandomRotation(cube as any, index));

const cubeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Add after camera setup
let activeCamera = camera as THREE.Camera;  // Start with main camera

// Add keyboard control to switch cameras
window.addEventListener('keydown', (event) => {
    if (event.key === 'c' || event.key === 'C') {
        console.log('switching camera');
        if (activeCamera === camera) {
            activeCamera = cubeCamera;
        } else if (activeCamera === cubeCamera) {
            activeCamera = spiralCamera;
        } else if (activeCamera === spiralCamera) {
            activeCamera = orbitingCamera;
        } else if (activeCamera === orbitingCamera) {
            activeCamera = topCamera;
        } else if (activeCamera === topCamera) {
            activeCamera = cube20Camera;
        } else if (activeCamera === cube20Camera) {
            activeCamera = cube20Camera2;
        } else {
            activeCamera = camera;
        }
    }
});

// Add after renderer setup
const bloomParams = {
    threshold: 0.5,
    strength: 0.5, // 5
    radius: 0.02,
    exposure: 0.4
};

// Setup composer with passes
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloomParams.strength,
    bloomParams.radius,
    bloomParams.threshold
);
const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// Update renderer settings
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = bloomParams.exposure;
renderer.setClearColor(0x1a1a1a);
// 0x3A3A3A

// Update the window resize handler
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    cubeCamera.aspect = width / height;
    cubeCamera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    composer.setSize(width, height);
});

const targetCube = cubeGroup.children[13];

// After other camera declarations
const spiralCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const targetCubeForSpiral = cubeGroup.children[30]; // Get the 30th cube

// After other camera declarations
const orbitingCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let orbitAngle = 0;

// Add top-down camera
const topCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
topCamera.position.set(0, 300, 0);  // Position high above the spiral
topCamera.lookAt(0, 0, 0);

activeCamera = topCamera;

// After other camera declarations
const cube20Camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const targetCube20 = cubeGroup.children[40]; // was 20

// After other camera declarations
const cube20Camera2 = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const targetCube20_2 = cubeGroup.children[50]; // Different cube from the first cube20Camera

// Add after camera declarations
const cameraMap = {
    'main': camera,
    'cube': cubeCamera,
    'spiral': spiralCamera,
    'orbiting': orbitingCamera,
    'top': topCamera,
    'cube20': cube20Camera,
    'cube20_2': cube20Camera2
};

// Add function to update URL
function updateCameraQueryString(cameraName: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('camera', cameraName);
    window.history.replaceState({}, '', url.toString());
}

// Add function to get initial camera from URL
function getInitialCamera(): THREE.Camera {
    const params = new URLSearchParams(window.location.search);
    const cameraParam = params.get('camera');
    return cameraParam && cameraMap[cameraParam as keyof typeof cameraMap] 
        ? cameraMap[cameraParam as keyof typeof cameraMap] 
        : camera; // Default to main camera
}

// Update initial camera assignment
activeCamera = getInitialCamera();

// Update camera switch event listener
window.addEventListener('keydown', (event) => {
    if (event.key === 'c' || event.key === 'C') {
        console.log('switching camera');
        if (activeCamera === camera) {
            activeCamera = cubeCamera;
            updateCameraQueryString('cube');
        } else if (activeCamera === cubeCamera) {
            activeCamera = spiralCamera;
            updateCameraQueryString('spiral');
        } else if (activeCamera === spiralCamera) {
            activeCamera = orbitingCamera;
            updateCameraQueryString('orbiting');
        } else if (activeCamera === orbitingCamera) {
            activeCamera = topCamera;
            updateCameraQueryString('top');
        } else if (activeCamera === topCamera) {
            activeCamera = cube20Camera;
            updateCameraQueryString('cube20');
        } else if (activeCamera === cube20Camera) {
            activeCamera = cube20Camera2;
            updateCameraQueryString('cube20_2');
        } else {
            activeCamera = camera;
            updateCameraQueryString('main');
        }
    }
});

// Update animate function (removed ascending camera logic)
function animate() {
    requestAnimationFrame(animate);
    
    cubeGroup.rotation.y -= 0.0015;
    
    // Update cube camera
    const offset = new THREE.Vector3(0, 0, 2);
    offset.applyQuaternion(targetCube.quaternion);
    cubeCamera.position.copy(targetCube.position).add(offset);
    cubeCamera.lookAt(targetCube.position);
    
    // Update spiral camera to follow cube 30
    const spiralOffset = new THREE.Vector3(0, 0, 15);
    spiralOffset.applyMatrix4(targetCubeForSpiral.matrixWorld);
    spiralCamera.position.copy(spiralOffset);
    spiralCamera.lookAt(targetCubeForSpiral.position);
    
    // Update orbiting camera
    orbitAngle += 0.005;
    const orbitRadius = 200;
    const orbitHeight = Math.sin(orbitAngle * 0.5) * 100;
    orbitingCamera.position.x = Math.cos(orbitAngle) * orbitRadius;
    orbitingCamera.position.z = Math.sin(orbitAngle) * orbitRadius;
    orbitingCamera.position.y = orbitHeight;
    orbitingCamera.lookAt(0, 0, 0);
    
    // Update cube20 camera
    cube20Camera.position.copy(targetCube20.position);
    cube20Camera.lookAt(0, 0, 0);
    
    // Update second cube20 camera
    const directionToCenter = targetCube20_2.position.clone().negate().normalize();
    const offsetDistance = 20; // Distance to move camera away from cube
    cube20Camera2.position.copy(targetCube20_2.position)
        .add(directionToCenter.multiplyScalar(-offsetDistance));
    cube20Camera2.lookAt(0, -8, 0);
    
    // Update renderScene to use activeCamera
    renderScene.camera = activeCamera;
    
    tweenGroup.update();
    controls.update();
    
    composer.render();
}

animate();
