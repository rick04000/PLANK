import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

// THREE.js Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0efe2);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 6;

const canvas = document.getElementById("planksterCanvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load GLB model
let planksterModel;
const loader = new THREE.GLTFLoader();
loader.load(
  'assets/plank.glb',
  function(gltf) {
    scene.add(gltf.scene);
  },
  undefined,
  function(error) {
    console.error(error);
  }
);

// Licht
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

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
