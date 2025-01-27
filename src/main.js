import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// Global state
let plankLevel = 1;
let plankMood = "Chill";
let isScamActive = false;

// DOM References
const plankLevelDisplay = document.getElementById("plankLevel");
const plankMoodDisplay = document.getElementById("plankMood");
const feedbackMsg = document.getElementById("feedbackMsg");
const startScamBtn = document.getElementById("startScamBtn");
const scamGameArea = document.getElementById("scamGameArea");
// Set up the scene, camera, and renderer
const container = document.getElementById('three-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Load the 3D model
const loader = new GLTFLoader();
loader.load('/plank.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    scene.add(model);
}, undefined, (error) => {
    console.error('An error occurred while loading the model:', error);
});

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.target.set(0, 0.5, 0);

// Handle resizing
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Animatieloop
function animate() {
  requestAnimationFrame(animate);
  
  if (planksterModel) {
    planksterModel.rotation.y += 0.01;
    planksterModel.rotation.x += 0.005;
  }

  renderer.render(scene, camera);
}
animate();

// Interactivity: feeding, mood swings, etc.
document.getElementById("feedPlankBtn").addEventListener("click", feedPlank);
function feedPlank() {
  plankLevel++;
  plankLevelDisplay.textContent = plankLevel;
  feedbackMsg.textContent = "Plankster munches on a jawbreaker!";
  setTimeout(() => feedbackMsg.textContent = "", 2000);

  if (plankLevel === 5) {
    plankMood = "Hyper";
  } else if (plankLevel === 10) {
    plankMood = "Jawbreaker Junkie";
  }
  plankMoodDisplay.textContent = plankMood;
}

document.getElementById("triggerReactionBtn").addEventListener("click", triggerMoodSwing);
function triggerMoodSwing() {
  const moods = ["Chill", "Salty", "Edgy AF", "Hyped", "Hangry", "Spaced Out"];
  plankMood = moods[Math.floor(Math.random() * moods.length)];
  plankMoodDisplay.textContent = plankMood;
  feedbackMsg.textContent = `Plankster is feeling: ${plankMood}`;
  setTimeout(() => feedbackMsg.textContent = "", 2000);
}

startScamBtn.addEventListener("click", () => {
  isScamActive = !isScamActive;
  scamGameArea.style.display = isScamActive ? "block" : "none";
  feedbackMsg.textContent = isScamActive 
    ? "Plankster is up to no good! Scam in progress..." 
    : "Scam ended. The cul-de-sac is safe... for now.";
  setTimeout(() => feedbackMsg.textContent = "", 3000);
});
