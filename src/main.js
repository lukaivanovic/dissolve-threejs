import * as THREE from "three";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";
import createParticlesFromGeometry from "./util/createParticlesFromGeometry";
import particleAnimation from "./util/animation";

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

const modelGeometry = new THREE.PlaneGeometry(1, 1, 20, 20); // 20x20 segments
const pointsGeometry = createParticlesFromGeometry(modelGeometry);

const points = new THREE.Points(
  modelGeometry,
  new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.01, // Adjust this value to make points visible
    transparent: true,
    opacity: 0.1, // Added opacity control
  })
);

const points2 = new THREE.Points(
  pointsGeometry,
  new THREE.PointsMaterial({
    color: 0xff0000,
    size: 0.01, // Adjust this value to make points visible
  })
);

// scene.add(points);
scene.add(points2);

const params = {
  time: 0,
  animationTime: 50,
};

function animate() {
  params.time += 1;
  particleAnimation(params.time, params.animationTime, points2);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
