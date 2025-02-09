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

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const index = (i * segments + j) * 3;

      // Convert grid position (i,j) to actual position in space
      positions[index] = (i / (segments - 1) - 0.5) * width; // x
      positions[index + 1] = (j / (segments - 1) - 0.5) * height; // y
      positions[index + 2] = 0; // z
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
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

function animate() {
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
