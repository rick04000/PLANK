/****************************************************
 * Global / DOM References & State
 ****************************************************/

// HTML container for rendering Three.js
const container = document.getElementById('three-container');

// Example button IDs (adapt to your HTML)
const feedBtn = document.getElementById('feedPlankBtn');
const moodBtn = document.getElementById('triggerReactionBtn');
const scamBtn = document.getElementById('startScamBtn');
const feedbackMsg = document.getElementById('feedbackMsg');
const scamArea = document.getElementById('scamGameArea');

// Example stats display
const plankLevelDisplay = document.getElementById('plankLevel');
const plankMoodDisplay = document.getElementById('plankMood');

// Plankster states
let plankLevel = 1;
let plankMood = 'Chill';
let isScamActive = false; // For our minigame placeholder

// 3D Model reference
let planksterModel = null;

/****************************************************
 * Scene, Camera, Renderer Setup
 ****************************************************/

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0efe2);

const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

/****************************************************
 * Lights
 ****************************************************/

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

/****************************************************
 * Load the 3D Model (Plankster)
 ****************************************************/

const loader = new THREE.GLTFLoader();
loader.load(
  "/src/plank.glb",  // <-- Path to your .glb file
  (gltf) => {
    // The loaded model is in gltf.scene
    planksterModel = gltf.scene;

    // Optionally, set initial scale or rotation
    planksterModel.position.set(0, 0, 0);
    planksterModel.scale.set(1, 1, 1);
    scene.add(planksterModel);
  },
  undefined,
  (error) => {
    console.error('An error occurred while loading the model:', error);
  }
);

/****************************************************
 * OrbitControls for 3D Exploration
 ****************************************************/
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.target.set(0, 0.5, 0);

/****************************************************
 * Handle Window Resizing
 ****************************************************/
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

/****************************************************
 * Animate Loop
 ****************************************************/
function animate() {
  requestAnimationFrame(animate);

  // Example "idle" rotation or any other effect
  if (planksterModel) {
    planksterModel.rotation.y += 0.005;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

/****************************************************
 * Interactivity Logic (Feeding, Mood Swings, Scams)
 ****************************************************/

// 1. Feeding
function feedPlank() {
  plankLevel++;
  plankLevelDisplay.textContent = plankLevel;

  // Quick comedic feedback
  feedbackMsg.textContent = 'Plankster munches on a jawbreaker!';
  setTimeout(() => {
    feedbackMsg.textContent = '';
  }, 2000);

  // Optional visual changes / expansions
  // E.g., scale plank slightly each time you feed it
  if (planksterModel) {
    const scaleIncrement = 0.01;
    planksterModel.scale.x += scaleIncrement;
    planksterModel.scale.y += scaleIncrement;
    planksterModel.scale.z += scaleIncrement;
  }

  // Example mood transitions based on level
  if (plankLevel === 5) {
    plankMood = 'Hyper';
  } else if (plankLevel === 10) {
    plankMood = 'Jawbreaker Junkie';
  }

  plankMoodDisplay.textContent = plankMood;
}

// 2. Mood Swings
function triggerMoodSwing() {
  // Randomize moods for comedic effect
  const moods = ['Chill', 'Salty', 'Edgy AF', 'Hyped', 'Hangry', 'Spaced Out'];
  plankMood = moods[Math.floor(Math.random() * moods.length)];
  plankMoodDisplay.textContent = plankMood;

  // Show comedic feedback
  feedbackMsg.textContent = `Plankster is feeling: ${plankMood}`;
  setTimeout(() => {
    feedbackMsg.textContent = '';
  }, 2000);
}

// 3. “Scam” Minigame (Simple Placeholder)
function toggleScam() {
  isScamActive = !isScamActive;
  scamArea.style.display = isScamActive ? 'block' : 'none';

  feedbackMsg.textContent = isScamActive
    ? 'Plankster is up to no good! Scam in progress...'
    : 'Scam ended. The cul-de-sac is safe... for now.';

  setTimeout(() => {
    feedbackMsg.textContent = '';
  }, 3000);
}

/****************************************************
 * Attach Event Listeners
 ****************************************************/
feedBtn?.addEventListener('click', feedPlank);
moodBtn?.addEventListener('click', triggerMoodSwing);
scamBtn?.addEventListener('click', toggleScam);