import * as THREE from "three";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";
import createParticlesFromGeometry from "./util/createParticlesFromGeometry";
import ParticleMaterial from "./materials/ParticleMaterial";
import DissolveMaterial from "./materials/DissolveMaterial";

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

camera.position.z = 5;

// Create any geometry
const modelGeometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
// Generate points
const pointsGeometry = createParticlesFromGeometry(modelGeometry);
// Create points mesh
const points = new THREE.Points(
  pointsGeometry,
  new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05, // Adjust this value to make points visible
  })
);

scene.add(points);

function animate() {
  // Rotate around Y axis
  points.rotation.y += 0.01;

  // You can also add rotation on other axes
  points.rotation.x += 0.005;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
