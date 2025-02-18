import * as THREE from "three";
import {
  getPointsFromGroup,
  getGeometryFromSVG,
  createBoundingBoxHelper,
} from "./util/utils";
import pointAnimation from "./util/animation";
import ParticleMaterial from "./materials/ParticleMaterial";
import DissolveMaterial from "./materials/DissolveMaterial";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 28;

let pointCloud;
let dissolveMaterial = DissolveMaterial;
let width = 0;

getGeometryFromSVG()
  .then(({ group, mergedGeometry }) => {
    const pointGeometry = getPointsFromGroup(group);
    pointCloud = new THREE.Points(pointGeometry, ParticleMaterial);

    mergedGeometry.computeBoundingBox();
    const bbox = mergedGeometry.boundingBox;
    console.log(bbox);
    width = bbox.max.x - bbox.min.x;
    dissolveMaterial.uniforms.min.value = bbox.min.x;
    dissolveMaterial.uniforms.max.value = bbox.max.x;
    const SVGShape = new THREE.Mesh(mergedGeometry, dissolveMaterial);

    const centerOffsetX = (bbox.max.x - bbox.min.x) / 2;
    const centerOffsetY = (bbox.max.y - bbox.min.y) / 2;

    pointCloud.scale.y = -1;
    pointCloud.position.set(-1 * centerOffsetX, centerOffsetY, 0);

    SVGShape.position.set(-1 * centerOffsetX, centerOffsetY, 0);
    SVGShape.scale.y = -1;

    scene.add(pointCloud);
    scene.add(SVGShape);
  })
  .catch((error) => {
    console.error("Error loading SVG:", error);
  });

const params = {
  time: 0,
  animationTime: 540,
  delayFrames: 800,
};

function animate() {
  if (pointCloud) {
    if (params.time >= params.delayFrames) {
      const linearProgress =
        (params.time - params.delayFrames) / params.animationTime;

      const effectProgress = linearProgress * linearProgress;

      pointAnimation(
        effectProgress,
        width,
        params.time - params.delayFrames,
        params.animationTime,
        pointCloud.geometry.attributes
      );
      dissolveMaterial.uniforms.threshold.value = effectProgress;
    }
    params.time++;
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
