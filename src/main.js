import { getPointsFromShape, getShapesFromSVG } from "./util/utils";
import * as THREE from "three";
import pointAnimation from "./util/animation";

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

camera.position.z = 20;

let pointCloud;

getShapesFromSVG()
  .then((group) => {
    const points = getPointsFromShape(group);

    // Create geometry from points array
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Calculate bounding box of the geometry
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;

    // Calculate the optimal camera position
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y);
    camera.position.z = maxDim * 2; // Adjust this multiplier as needed
    camera.position.x = (box.max.x - box.min.x) / 2;
    camera.position.y = (box.min.y - box.max.y) / 2;

    // Create white point material
    const material = new THREE.PointsMaterial({
      color: 0xffffff, // white color
      size: 0.001, // small point size
      sizeAttenuation: true, // size will change based on distance from camera
    });

    // Create points object and add to scene
    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);
  })
  .catch((error) => {
    console.error("Error loading SVG:", error);
  });

const params = {
  time: 0,
  animationTime: 400,
};

function animate() {
  if (pointCloud) {
    pointAnimation(
      params.time,
      params.animationTime,
      pointCloud.geometry.attributes
    );
    params.time++;
  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
