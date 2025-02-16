import { getPointsFromShape, getShapesFromSVG } from "./util/utils";
import * as THREE from "three";
import pointAnimation from "./util/animation";
import ParticleMaterial from "./materials/ParticleMaterial";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

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
    const geometry = getPointsFromShape(group);

    pointCloud = new THREE.Points(geometry, ParticleMaterial);

    const geometries = [];

    group.traverse((child) => {
      if (child.isMesh) {
        geometries.push(child.geometry);
      }
    });

    const mergedGeometry = mergeGeometries(geometries);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mergedMesh = new THREE.Mesh(mergedGeometry, material);

    scene.add(mergedMesh);

    scene.add(pointCloud);

    /*
    pointCloud = geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y);
    camera.position.z = maxDim * 2;
    camera.position.x = (box.max.x - box.min.x) / 2;
    camera.position.y = (box.min.y - box.max.y) / 2;
    */
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
