import * as THREE from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';


/******************************************************
 * DOM ELEMENTS
 ******************************************************/
const container = document.getElementById('three-container');

// Buttons / UI
const feedBtn = document.getElementById('feedPlankBtn');
const moodBtn = document.getElementById('triggerReactionBtn');
const scamBtn = document.getElementById('startScamBtn');
const bg1Btn = document.getElementById('bg1Btn');
const bg2Btn = document.getElementById('bg2Btn');
const bg3Btn = document.getElementById('bg3Btn');
const bg4Btn = document.getElementById('bg4Btn');

// Displays
const plankLevelDisplay = document.getElementById('plankLevel');
const plankMoodDisplay = document.getElementById('plankMood');
const feedbackMsg = document.getElementById('feedbackMsg');
const scamGameArea = document.getElementById('scamGameArea');

/******************************************************
 * GLOBAL STATES
 ******************************************************/
let plankLevel = 1;
let plankMood = 'Chill';
let isScamActive = false;  // For toggling minigame area
let planksterModel = null; // Reference to loaded model

// If you want to store multiple materials for color changes:
const defaultColor = new THREE.Color(0xffffff); // We'll restore to this
const altColor = new THREE.Color(0x00ff00);     // Example "fed" color

/******************************************************
 * THREE.JS SCENE SETUP
 ******************************************************/
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0efe2);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

/******************************************************
 * LOAD GLB MODEL (Plankster)
 ******************************************************/
const loader = new GLTFLoader();
let mixer; // For animations
loader.load('./models/plank.glb', (gltf) => {
    planksterModel = gltf.scene;
    scene.add(planksterModel);

    // Apply animations if available
    if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
    }

    model.position.set(0, 0, 0);
    model.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
}, undefined, (error) => {
    console.error('An error occurred:', error);
});


/******************************************************
 * BOUNCE ANIMATION
 * We'll animate by adjusting the Y position
 ******************************************************/
const clock = new THREE.Clock();
const bounceSpeed = 3;       // How fast it bounces
const bounceAmplitude = 0.05; // How high it bounces

/******************************************************
 * ANIMATE LOOP
 ******************************************************/
function animate() {
  requestAnimationFrame(animate);
  
  const elapsed = clock.getElapsedTime();
  
  // If model is loaded, we do a gentle bounce
  if (planksterModel) {
    const bounce = Math.sin(elapsed * bounceSpeed) * bounceAmplitude;
    planksterModel.position.y = bounce;
  }

  renderer.render(scene, camera);
}
animate();

/******************************************************
 * INTERACTIONS
 ******************************************************/

// 1. Feed
function feedPlank() {
  plankLevel++;
  plankLevelDisplay.textContent = plankLevel;
  
  feedbackMsg.textContent = 'Plankster munches on a jawbreaker!';
  setTimeout(() => { feedbackMsg.textContent = ''; }, 2000);

  // Example: Scale up slightly each time
  if (planksterModel) {
    planksterModel.scale.x += 0.01;
    planksterModel.scale.y += 0.01;
    planksterModel.scale.z += 0.01;
  }

  // Example: Change color briefly
  if (planksterModel) {
    planksterModel.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(altColor);
      }
    });
  }
  // Restore color after a short delay
  setTimeout(() => {
    if (planksterModel) {
      planksterModel.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(defaultColor);
        }
      });
    }
  }, 1500);

  // Mood changes at certain levels
  if (plankLevel === 5) {
    plankMood = 'Hyper';
  } else if (plankLevel === 10) {
    plankMood = 'Jawbreaker Junkie';
  }
  plankMoodDisplay.textContent = plankMood;
}

// 2. Mood Swing
function triggerMoodSwing() {
  const moods = ['Chill', 'Salty', 'Edgy AF', 'Hyped', 'Hangry', 'Spaced Out'];
  plankMood = moods[Math.floor(Math.random() * moods.length)];
  plankMoodDisplay.textContent = plankMood;

  feedbackMsg.textContent = `Plankster is feeling: ${plankMood}`;
  setTimeout(() => { feedbackMsg.textContent = ''; }, 2000);
}

// 3. Scam Toggle
function toggleScam() {
  isScamActive = !isScamActive;
  scamGameArea.style.display = isScamActive ? 'block' : 'none';

  feedbackMsg.textContent = isScamActive
    ? 'Plankster is up to no good! Scam in progress...'
    : 'Scam ended. The cul-de-sac is safe... for now.';
  
  setTimeout(() => { feedbackMsg.textContent = ''; }, 3000);
}

/******************************************************
 * SCENE CHOOSER (BACKGROUND IMAGES)
 * We'll just set container.style.background as an example.
 ******************************************************/
function setSceneBackground(sceneNumber) {
  // Replace these with actual image URLs or local paths
  const backgrounds = [
    'url("assets/bg1.jpg")',
    'url("assets/bg2.jpg")',
    'url("assets/bg3.jpg")',
    'url("assets/bg4.jpg")'
  ];
  
  // Safety check in case we exceed the array
  if (sceneNumber < 1 || sceneNumber > backgrounds.length) return;
  
  container.style.backgroundImage = backgrounds[sceneNumber - 1];
  container.style.backgroundSize = 'cover';
  container.style.backgroundPosition = 'center';
}

/******************************************************
 * ATTACH EVENT LISTENERS
 ******************************************************/
feedBtn?.addEventListener('click', feedPlank);
moodBtn?.addEventListener('click', triggerMoodSwing);
scamBtn?.addEventListener('click', toggleScam);

bg1Btn?.addEventListener('click', () => setSceneBackground(1));
bg2Btn?.addEventListener('click', () => setSceneBackground(2));
bg3Btn?.addEventListener('click', () => setSceneBackground(3));
bg4Btn?.addEventListener('click', () => setSceneBackground(4));

/******************************************************
 * HANDLE WINDOW RESIZE
 ******************************************************/
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
