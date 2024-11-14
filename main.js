import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light for better shading
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(0, 5, 0);
scene.add(directionalLight);

// Create red cube
const redGeometry = new THREE.BoxGeometry(1, 1, 1);
const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const redCube = new THREE.Mesh(redGeometry, redMaterial);
redCube.position.set(-2, 0.5, 0);
scene.add(redCube);

// Create green cube
const greenGeometry = new THREE.BoxGeometry(1, 1, 1);
const greenMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const greenCube = new THREE.Mesh(greenGeometry, greenMaterial);
greenCube.position.set(0, 1.5, 0);
scene.add(greenCube);

// Create blue cube
const blueGeometry = new THREE.BoxGeometry(1, 1, 1);
const blueMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const blueCube = new THREE.Mesh(blueGeometry, blueMaterial);
blueCube.position.set(2, 0.5, 0);
scene.add(blueCube);

// Create white floor
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
floor.position.y = -0.5; // Position slightly below the cubes
scene.add(floor);

const body = new THREE.Group();

const loader = new GLTFLoader();

loader.load('assets/shotgun.glb', function (gltf) {
  let model = gltf.scene;
  model.position.x += 0.2;
  model.position.y -= 0.25;
  model.position.z -= 0.5;
  camera.add(model);
}, undefined, function (error) {
  console.error(error);
});

body.add(camera);
scene.add(body);

// Key dictionary to track key states
const keys = {
  'w': false,
  'a': false,
  's': false,
  'd': false,
};

document.onkeydown = function (e) {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true; // Set the key state to true when pressed
  }
};

document.onkeyup = function (e) {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false; // Set the key state to false when released
  }
};

document.addEventListener('mousemove', (e) => {
  const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
  const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

  const mx = movementX * 0.002;
  const my = -movementY * 0.002;
  camera.rotateX(my);
  body.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -mx);
});

document.onclick = () => {
  document.body.requestPointerLock();
};

let velocity = new THREE.Vector3(0, 0, 0);
let gravity = -0.001;
let grounded = false;

// Movement target to store the desired position for x and z
let targetPosition = new THREE.Vector3();
let lerpSpeed = 0.03; // Adjust this value for more or less smoothing

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && grounded) {
      velocity.y = 0.075; // Set the upward velocity once when "a" is pressed
  }
});

function animate() {
  const moveSpeed = 0.1;

  // Calculate horizontal (A/D) and vertical (W/S) movement axes
  const horizontalInput = (keys['a'] ? -1 : 0) + (keys['d'] ? 1 : 0);  // -1 for 'a', 1 for 'd'
  const verticalInput = (keys['w'] ? 1 : 0) + (keys['s'] ? -1 : 0);    // 1 for 'w', -1 for 's'

  // Create a target velocity vector based on input
  const targetVelocity = new THREE.Vector3();

  // Horizontal movement (A/D)
  targetVelocity.x = horizontalInput * moveSpeed;

  // Vertical movement (W/S)
  targetVelocity.z = verticalInput * moveSpeed;

  // Smoothly lerp the velocity for x and z
  velocity.x = THREE.MathUtils.lerp(velocity.x, targetVelocity.x, 0.1);
  velocity.z = THREE.MathUtils.lerp(velocity.z, targetVelocity.z, 0.1);

  // Apply gravity to y velocity
  velocity.y += gravity;

  // Update the camera position based on velocity
  body.translateX(velocity.x);
  body.translateZ(-velocity.z);

  body.position.y += velocity.y;

  // Make sure the camera stays above the ground (grounded check)
  if (body.position.y <= 1.5) {
    body.position.y = 1.5;
    velocity.y = 0;
    grounded = true;
  } else {
    grounded = false;
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}



animate();
