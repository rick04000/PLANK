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

// ========== THREE.JS SETUP ========== //

// 1. Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0efe2); // Light cartoony background

// 2. Camera
// FOV, aspect ratio, near clipping, far clipping
const camera = new THREE.PerspectiveCamera(
  45, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.z = 6; // Move camera back slightly

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("planksterCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);

// 4. Resizing
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 5. Create a "Plank" Mesh
//    Using a simple BoxGeometry as a stand-in for a tall plank
const plankGeometry = new THREE.BoxGeometry(1, 3, 0.2);
const plankMaterial = new THREE.MeshBasicMaterial({ color: 0xb5651d }); // A wood-like brown
const plankMesh = new THREE.Mesh(plankGeometry, plankMaterial);
scene.add(plankMesh);

// Optional: Add a simple ambient light so we can see the plank better
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// ========== ANIMATION LOOP ========== //

function animate() {
  requestAnimationFrame(animate);

  // Simple rotation for Plankster
  plankMesh.rotation.y += 0.01;
  plankMesh.rotation.x += 0.005;

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
  feedbackMsg.textContent = `Plankster is feeling: ${plankMood}`;
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
