import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

/***************************************************
 * 1. DOM Elements and Initial Styling
 ***************************************************/
const container = document.getElementById('three-container');

// Give the container an initial background image
container.style.backgroundImage = 'url("assets/bg1.jpg")';
container.style.backgroundSize = 'cover';
container.style.backgroundPosition = 'center';

// Buttons / UI
const feedBtn = document.getElementById('feedPlankBtn');
const moodBtn = document.getElementById('triggerReactionBtn');
const scamBtn = document.getElementById('startScamBtn');

// Displays
const plankLevelDisplay = document.getElementById('plankLevel');
const plankMoodDisplay = document.getElementById('plankMood');
const feedbackMsg = document.getElementById('feedbackMsg');
const scamGameArea = document.getElementById('scamGameArea');

/***************************************************
 * 2. Global States
 ***************************************************/
let plankLevel = 1;
let plankMood = 'Chill';
let isScamActive = false;

// Basic physics
const position = new THREE.Vector3(0, 0, 0);     // model position
const velocity = new THREE.Vector3(0, 0, 0);     // model velocity
const acceleration = new THREE.Vector3(0, -9.8 * 0.002, 0); // simplistic gravity

let planksterModel = null;
let mixer = null;   // Three.js AnimationMixer
let currentAction = null;

// For random walking/jumping
let randomMovementInterval = null;

// For picking / throwing
let isDragging = false;
const mouse = new THREE.Vector2();         // normalized device coordinates
let dragStartWorldPos = new THREE.Vector3();
let dragOffset = new THREE.Vector3();
let isModelPicked = false;

/***************************************************
 * 3. Scene, Camera, Renderer
 ***************************************************/
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0efe2);

const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

/***************************************************
 * 4. Lights
 ***************************************************/
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

/***************************************************
 * 5. Load Model & Extract Animations
 ***************************************************/
const loader = new GLTFLoader();
loader.load(
  '/plank.glb', // Update path as needed
  (gltf) => {
    planksterModel = gltf.scene;
    planksterModel.scale.set(1, 1, 1);
    scene.add(planksterModel);

    // Initialize AnimationMixer
    mixer = new AnimationMixer(planksterModel);

    // We assume your GLB has multiple animations,
    // e.g., "Idle", "Moody", "Hyper", etc.
    // Let's store them in a dictionary by name:
    const allClips = gltf.animations; // array of AnimationClips
    allClips.forEach((clip) => {
      // just log them to see the names
      console.log('Found animation:', clip.name);
    });

    // Start with Idle (if it exists)
    playAnimation('Idle', allClips);

    // Start random movements after loading
    startRandomMovement();
  },
  undefined,
  (error) => {
    console.error('Error loading Plankster model:', error);
  }
);

/***************************************************
 * 6. Function: Play Animation
 ***************************************************/
function playAnimation(clipName, clipArray) {
  if (!mixer || !clipArray) return;
  const clip = clipArray.find((c) => c.name === clipName);
  if (!clip) {
    console.warn(`Animation "${clipName}" not found in GLB.`);
    return;
  }
  // Stop the current action if any
  if (currentAction) {
    currentAction.stop();
  }
  // Create a new action from the clip
  const newAction = mixer.clipAction(clip);
  newAction.reset().play();
  currentAction = newAction;
}

/***************************************************
 * 7. Random Movement Interval
 ***************************************************/
function startRandomMovement() {
  if (randomMovementInterval) clearInterval(randomMovementInterval);
  randomMovementInterval = setInterval(() => {
    // If currently "picked up," skip random movement
    if (isModelPicked) return;

    // Random horizontal velocity
    velocity.x = (Math.random() - 0.5) * 0.3;

    // 30% chance to do a small jump
    if (Math.random() > 0.7) {
      velocity.y = 0.06 + Math.random() * 0.05;
    }
  }, 2000);
}

/***************************************************
 * 8. Animate Loop
 ***************************************************/
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Update mixer (animations) if loaded
  if (mixer) mixer.update(delta);

  // Physics update if not currently dragging
  if (!isDragging || !isModelPicked) {
    // Add gravity
    velocity.addScaledVector(acceleration, delta);

    // Update position
    position.addScaledVector(velocity, delta);

    // Floor collision
    if (position.y < 0) {
      position.y = 0;
      velocity.y = 0;
    }

    // Boundary check on X
    const maxX = 2.5;
    if (position.x > maxX) {
      position.x = maxX;
      velocity.x *= -0.5; // bounce back
    } else if (position.x < -maxX) {
      position.x = -maxX;
      velocity.x *= -0.5;
    }

    // Update 3D model
    if (planksterModel) {
      planksterModel.position.copy(position);
    }
  }

  renderer.render(scene, camera);
}
animate();

/***************************************************
 * 9. Mouse / Picking / Throwing
 ***************************************************/
const raycaster = new THREE.Raycaster();

// on mousedown, we see if we hit the model
container.addEventListener('mousedown', (event) => {
  isDragging = true;
  isModelPicked = false;

  // Convert mouse to normalized device coords
  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

  // Raycast
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(planksterModel, true);
  if (intersects.length > 0) {
    // We picked the model
    isModelPicked = true;

    // zero out velocity so it doesn't keep moving
    velocity.set(0, 0, 0);

    // capture the difference between model pos & ray hit
    dragStartWorldPos.copy(intersects[0].point);
    dragOffset.copy(planksterModel.position).sub(dragStartWorldPos);
  }
});

container.addEventListener('mousemove', (event) => {
  if (!isDragging || !isModelPicked) return;

  // Convert mouse to normalized device coords
  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

  raycaster.setFromCamera(mouse, camera);
  // We expect the plane or some reference in the scene, but let's just assume we move in X/Y
  // For a more robust approach, you'd use an invisible plane at model's Z to get the intersection.
  const planeZ = 0; // or approximate plank's current Z
  // We can do a function to "unproject" the mouse at planeZ:
  const ndcPos = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(camera);
  // Our camera is perspective, so let's manually compute the intersection with planeZ
  const camPos = camera.position.clone();
  const dir = ndcPos.clone().sub(camPos).normalize();
  const t = (planeZ - camPos.z) / dir.z;
  const worldPos = camPos.add(dir.multiplyScalar(t));

  // Now adjust position with the original offset
  position.copy(worldPos.add(dragOffset));

  // clamp floor
  if (position.y < 0) position.y = 0;
  
  // Update model position
  if (planksterModel) {
    planksterModel.position.copy(position);
  }
});

container.addEventListener('mouseup', (event) => {
  if (isModelPicked) {
    // compute "throw" velocity from final mouse movement
    const rect = container.getBoundingClientRect();
    const mouseReleaseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseReleaseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

    // simplistic approach: difference in mouse coords * factor
    const dx = mouseReleaseX - mouse.x;
    const dy = mouseReleaseY - mouse.y;
    velocity.x = dx * -3; // negative might feel more intuitive
    velocity.y = dy * -3;
  }

  isDragging = false;
  isModelPicked = false;
});

/***************************************************
 * 10. Feeding, Mood, Scam, with Animations
 ***************************************************/
function feedPlank() {
  plankLevel++;
  plankLevelDisplay.textContent = plankLevel;

  feedbackMsg.textContent = 'Plankster munches on a jawbreaker!';
  setTimeout(() => { feedbackMsg.textContent = ''; }, 2000);

  // Example: If user has multiple animations for "Eating", "Happy"
  // Here, we assume there's a "Happy" anim for demonstration:
  if (mixer) {
    // This requires the GLB to contain a clip named "Happy"
    const allClips = mixer.getRoot().animations;
    playAnimation('Happy', allClips);
  }

  // Mood changes at certain levels
  if (plankLevel === 5) {
    plankMood = 'Hyper';
  } else if (plankLevel === 10) {
    plankMood = 'Jawbreaker Junkie';
  }
  plankMoodDisplay.textContent = plankMood;
}

function triggerMoodSwing() {
  const moods = ['Chill', 'Salty', 'Edgy AF', 'Hyped', 'Hangry', 'Spaced Out'];
  plankMood = moods[Math.floor(Math.random() * moods.length)];
  plankMoodDisplay.textContent = plankMood;

  feedbackMsg.textContent = `Plankster is feeling: ${plankMood}`;
  setTimeout(() => { feedbackMsg.textContent = ''; }, 2000);

  // Example: trigger different animations by mood
  if (mixer) {
    const allClips = mixer.getRoot().animations;
    if (plankMood === 'Hyped') {
      playAnimation('Hyper', allClips);
    } else if (plankMood === 'Salty' || plankMood === 'Edgy AF') {
      playAnimation('Moody', allClips); // e.g., "Moody" animation
    } else {
      playAnimation('Idle', allClips);
    }
  }
}

function toggleScam() {
  isScamActive = !isScamActive;
  scamGameArea.style.display = isScamActive ? 'block' : 'none';

  feedbackMsg.textContent = isScamActive
    ? 'Plankster is up to no good! Scam in progress...'
    : 'Scam ended. The cul-de-sac is safe... for now.';
  
  setTimeout(() => { feedbackMsg.textContent = ''; }, 3000);

  // If you have a silly "Scam" animation, play it:
  if (mixer) {
    const allClips = mixer.getRoot().animations;
    if (isScamActive) {
      playAnimation('ScamDance', allClips); 
    } else {
      playAnimation('Idle', allClips);
    }
  }
}

/***************************************************
 * 11. Attach Event Listeners
 ***************************************************/
feedBtn?.addEventListener('click', feedPlank);
moodBtn?.addEventListener('click', triggerMoodSwing);
scamBtn?.addEventListener('click', toggleScam);

window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
