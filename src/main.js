import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function createGridPoints(width, height, segments) {
  const positions = new Float32Array(segments * segments * 3); // xyz for each point
  const velocities = new Float32Array(segments * segments * 3);
  const initialPositions = new Float32Array(segments * segments * 3);
  const indexes = new Float32Array(segments * segments);

  let indexCounter = 0;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const index = (i * segments + j) * 3;

      // Initial position
      positions[index] = (i / (segments - 1) - 0.5) * width;
      positions[index + 1] = (j / (segments - 1) - 0.5) * height;
      positions[index + 2] = 0;

      // Store initial positions for reference
      initialPositions[index] = positions[index];
      initialPositions[index + 1] = positions[index + 1];
      initialPositions[index + 2] = positions[index + 2];

      velocities[index] = (Math.random() * 0.2 + 0.8) * 0.02;
      velocities[index + 1] = (Math.random() - 0.7) * 0.005;
      velocities[index + 2] = 0; // z velocity

      indexes[indexCounter] = indexCounter;
      indexCounter++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute(
    "initialPosition",
    new THREE.BufferAttribute(initialPositions, 3)
  );
  geometry.setAttribute("index", new THREE.BufferAttribute(indexes, 1));
  return geometry;
}

// Use it in your scene
const geometry = createGridPoints(1, 1, 20); // 20x20 grid of points
const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.02,
  sizeAttenuation: true,
});
const points = new THREE.Points(geometry, material);
scene.add(points);

camera.position.z = 5;

const params = {
  time: 0.0,
};

function animate() {
  params.time += 0.01;
  const indexes = points.geometry.attributes.index.array;
  const positions = points.geometry.attributes.position.array;
  const velocities = points.geometry.attributes.velocity.array;

  for (let i = 0; i < positions.length; i += 3) {
    // Update positions with velocities
    if (indexes[i / 3] < params.time * 100) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];
    }
  }

  points.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

console.log(points.geometry.attributes.index.array);

renderer.setAnimationLoop(animate);
