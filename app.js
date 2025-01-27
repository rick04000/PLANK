/************************************************
 * app.js – Main JavaScript for Plankster ($PLNK)
 * 
 * 1. Initializes Three.js scene, camera, and renderer.
 * 2. Loads a simple "Plank" mesh as a stand-in for Plankster.
 * 3. Implements feeding and mood change interactions.
 ************************************************/

// Global state variables
let plankLevel = 1;
let plankMood = "Chill";
let isScamActive = false; // For our minigame placeholder

// DOM element references
const plankLevelDisplay = document.getElementById("plankLevel");
const plankMoodDisplay = document.getElementById("plankMood");
const feedbackMsg = document.getElementById("feedbackMsg");
const startScamBtn = document.getElementById("startScamBtn");
const scamGameArea = document.getElementById("scamGameArea");

/************************************************
 * app.js – Updated to include GLB model
 ************************************************/

// 1. Scene, Camera, Renderer remain the same as #005...
// (same code as before for scene, camera, renderer)

let planksterModel;  // We'll store the loaded model in this variable

// 2. GLTFLoader
// If using script tags, we already have GLTFLoader in the global THREE namespace.
// If using modules: import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new THREE.GLTFLoader();
loader.load(
  "/src/plank.glb",  // <-- Path to your .glb file
  (gltf) => {
    // The loaded model is in gltf.scene
    planksterModel = gltf.scene;

    // Optionally, set initial scale or rotation
    planksterModel.scale.set(1, 1, 1);
    planksterModel.rotation.y = Math.PI; // Just an example; adjust as needed

    scene.add(planksterModel);
  },
  (xhr) => {
    // Called while loading is progressing
    console.log((xhr.loaded / xhr.total * 100) + "% loaded");
  },
  (error) => {
    // Called if there's an error in loading
    console.error("An error occurred while loading the model:", error);
  }
);

// 3. Ambient Light remains the same
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// 4. Animate Loop (slightly modified)
function animate() {
  requestAnimationFrame(animate);

  // If our GLTF model has loaded, spin it or update it as needed
  if (planksterModel) {
    planksterModel.rotation.y += 0.01;
    planksterModel.rotation.x += 0.005;
  }

  renderer.render(scene, camera);
}
animate();

// ========== INTERACTIVITY LOGIC ========== //

// Feeding logic
document.getElementById("feedPlankBtn").addEventListener("click", feedPlank);

function feedPlank() {
  // Increase level, update display
  plankLevel++;
  plankLevelDisplay.textContent = plankLevel;

  // Quick comedic feedback
  feedbackMsg.textContent = "Plankster munches on a jawbreaker!";
  setTimeout(() => {
    feedbackMsg.textContent = "";
  }, 2000);

  // Potential advanced logic: 
  // If level hits certain milestones, change color, mood, or other visuals
  if (plankLevel === 5) {
    plankMood = "Hyper";
    plankMoodDisplay.textContent = plankMood;
  } else if (plankLevel === 10) {
    plankMood = "Jawbreaker Junkie";
    plankMoodDisplay.textContent = plankMood;
  }
}

// Mood swing logic
document.getElementById("triggerReactionBtn").addEventListener("click", triggerMoodSwing);

function triggerMoodSwing() {
  // Randomize moods for edgy comedic effect
  const moods = ["Chill", "Salty", "Edgy AF", "Hyped", "Hangry", "Spaced Out"];
  plankMood = moods[Math.floor(Math.random() * moods.length)];
  plankMoodDisplay.textContent = plankMood;

  // Cheeky message
  feedbackMsg.textContent = Plankster is feeling: ${plankMood};
  setTimeout(() => {
    feedbackMsg.textContent = "";
  }, 2000);
}

// Minigame / Scam placeholder
startScamBtn.addEventListener("click", () => {
  isScamActive = !isScamActive;
  scamGameArea.style.display = isScamActive ? "block" : "none";

  if (isScamActive) {
    feedbackMsg.textContent = "Plankster is up to no good! Scam in progress...";
  } else {
    feedbackMsg.textContent = "Scam ended. The cul-de-sac is safe... for now.";
  }
  setTimeout(() => {
    feedbackMsg.textContent = "";
  }, 3000);
});