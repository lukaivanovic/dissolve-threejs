import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import * as THREE from "three";

export default function () {
  const loader = new SVGLoader();

  loader.load(
    "src/assets/test.svg",
    function (data) {
      const vertices = [];

      data.paths.forEach((path) => {
        const shapes = SVGLoader.createShapes(path);

        shapes.forEach((shape) => {
          // Get points from the shape path
          const points = shape.getPoints(10); // 50 is number of points
          vertices.push(...points);
        });
      });

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

      const geometry = new THREE.BufferGeometry();

      // Convert Vector2 points to Vector3
      const positions = new Float32Array(vertices.length * 3);
      vertices.forEach((point, i) => {
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = 0;
      });

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      const material = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      console.log(vertices);

      function animate() {
        // particleAnimation(params.time, params.animationTime, points2);

        renderer.render(scene, camera);
      }

      renderer.setAnimationLoop(animate);
    },
    function (error) {
      console.log("An error happened");
    }
  );
}
