// /script.js
// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 600 / 400, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(600, 400);
document.getElementById('model-container').appendChild(renderer.domElement);

// Add lighting
const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

// Load GLB model
const loader = new THREE.GLTFLoader();
let plank;
loader.load(
  'assets\plank.glb', // Replace with the actual path
  (gltf) => {
    plank = gltf.scene;
    plank.scale.set(1, 1, 1);
    scene.add(plank);
    animate(); // Start rendering
  },
  undefined,
  (error) => console.error(error)
);

// Set initial camera position
camera.position.z = 5;

// Plank state
let level = 1;
let mood = 'Chill';

// Function to update the level and mood indicators
const updateIndicators = () => {
  document.getElementById('level-indicator').textContent = level;
  document.getElementById('mood-indicator').textContent = mood;
};

// Autonomous movement
let direction = 1; // 1 for right, -1 for left
const movePlank = () => {
  if (!plank) return;
  plank.position.x += 0.02 * direction;
  if (plank.position.x > 2 || plank.position.x < -2) {
    direction *= -1; // Change direction
  }
};

// Feed jawbreaker
document.getElementById('feed-jawbreaker').addEventListener('click', () => {
  level = Math.min(level + 1, 10); // Max level is 10
  mood = level >= 10 ? 'Jawbreaker Junkie' : mood;
  updateIndicators();

  if (plank) {
    plank.scale.set(level / 5, level / 5, level / 5); // Scale based on level
  }
});

// Change mood
document.getElementById('mood-select').addEventListener('change', (event) => {
  mood = event.target.value;
  updateIndicators();

  // Change color based on mood
  if (plank) {
    const moodColors = {
      Chill: 0x1f77b4,
      Salty: 0x9467bd,
      'Edgy AF': 0xff7f0e,
      Hyped: 0x2ca02c,
      Hangry: 0xd62728,
      'Spaced Out': 0x17becf,
    };
    plank.traverse((child) => {
      if (child.isMesh) {
        child.material.color.setHex(moodColors[mood] || 0xffffff);
      }
    });
  }
});

// Animate scene
const animate = () => {
  requestAnimationFrame(animate);
  movePlank(); // Add autonomous movement
  renderer.render(scene, camera);
};
