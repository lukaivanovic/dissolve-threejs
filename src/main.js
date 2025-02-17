import {
  getPointsFromGroup,
  getGeometryFromSVG,
  createBoundingBoxHelper,
} from "./util/utils";
import * as THREE from "three";
import pointAnimation from "./util/animation";
import ParticleMaterial from "./materials/ParticleMaterial";

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

getGeometryFromSVG()
  .then(({ group, mergedGeometry }) => {
    const pointMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.001,
    });

    const pointGeometry = getPointsFromGroup(group);
    pointCloud = new THREE.Points(pointGeometry, pointMaterial);

    const groupBBoxHelper = createBoundingBoxHelper(group, 0xffff00); // yellow for group
    const pointCloudBBoxHelper = createBoundingBoxHelper(pointCloud, 0xff0000); // red for point cloud

    scene.add(groupBBoxHelper);
    scene.add(pointCloudBBoxHelper);

    scene.add(pointCloud);

    group.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          opacity: 0.3,
          transparent: true,
        });
      }
    });

    scene.add(group);

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
  /*
  if (pointCloud) {
    pointAnimation(
      params.time,
      params.animationTime,
      pointCloud.geometry.attributes
    );
    params.time++;
  }
  */

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
