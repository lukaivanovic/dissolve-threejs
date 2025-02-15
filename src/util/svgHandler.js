import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import * as THREE from "three";

export default function (scene) {
  const loader = new SVGLoader();

  loader.load(
    "src/assets/test.svg",
    function (data) {
      const paths = data.paths;
      const group = new THREE.Group();

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];

        const material = new THREE.MeshBasicMaterial({
          color: path.color,
          side: THREE.DoubleSide,
          depthWrite: false,
          transparent: true,
          opacity: 0.2,
        });

        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j];
          const geometry = new THREE.ShapeGeometry(shape);
          getPoints(shape, 50, scene);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        }
      }

      scene.add(group);
    },
    function (xhr) {
      console.log("loading");
    },
    function (error) {
      console.log("An error happened");
    }
  );
}

function getPoints(shape, numPoints = 50, scene) {
  // Check if input is a valid THREE.Shape or THREE.Path
  if (!(shape instanceof THREE.Shape) && !(shape instanceof THREE.Path)) {
    throw new Error("Input must be a THREE.Shape or THREE.Path");
  }

  // Get equally distributed points along the shape
  const points = shape.getSpacedPoints(numPoints);
  console.log(points);

  // Create geometry from points
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(points.length * 3);

  // Fill positions array with x,y,z coordinates
  for (let i = 0; i < points.length; i++) {
    positions[i * 3] = points[i].x;
    positions[i * 3 + 1] = points[i].y;
    positions[i * 3 + 2] = 0;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // Create point material
  const material = new THREE.PointsMaterial({
    color: 0xff0000,
    size: 0.1,
  });

  // Create points object and add to scene
  const pointsObject = new THREE.Points(geometry, material);
  scene.add(pointsObject);
  // Convert points to regular array of Vector2
  // return points.map((point) => new THREE.Vector2(point.x, point.y));
}
