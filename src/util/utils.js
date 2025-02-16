import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

export function getPointsFromShape(group) {
  const points = [];
  const density = 0.2;
  let bb = new THREE.Box3().setFromObject(group);

  group.traverse((child) => {
    if (child.type === "Mesh") {
      child.geometry.computeBoundingBox();
      const shape = child.geometry.parameters.shapes;

      for (let x = bb.min.x; x <= bb.max.x; x += density) {
        for (let y = bb.min.y; y <= bb.max.y; y += density) {
          if (isPointInShape(new THREE.Vector2(x, y), shape)) {
            points.push(new THREE.Vector3(x, -y, 0));
          }
        }
      }
    }
  });

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return createPointGeometry(geometry);
}

function isPointInShape(point, shape) {
  // Ray casting algorithm for point-in-polygon testing
  let inside = false;

  const shapePts = shape.getPoints();

  for (let i = 0, j = shapePts.length - 1; i < shapePts.length; j = i++) {
    const xi = shapePts[i].x,
      yi = shapePts[i].y;
    const xj = shapePts[j].x,
      yj = shapePts[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function createPointGeometry(geometry) {
  const positions = geometry.attributes.position.array;
  const totalPoints = positions.length / 3;
  const velocities = new Float32Array(totalPoints * 3);
  const initialPositions = new Float32Array(totalPoints * 3);
  const columnIndices = new Float32Array(totalPoints);
  const opacities = new Float32Array(totalPoints);
  const initialY = new Float32Array(totalPoints);
  const pointPositions = new Float32Array(totalPoints * 3);

  // Calculate bounds first
  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]);
    maxX = Math.max(maxX, positions[i]);
  }
  const xRange = Math.abs(maxX - minX);

  // Store these as attributes
  const bounds = new Float32Array(3); // [minX, maxX, xRange]
  bounds[0] = minX;
  bounds[1] = maxX;
  bounds[2] = xRange;

  for (let i = 0; i < totalPoints; i++) {
    const index = i * 3;

    const x = positions[index];
    const y = positions[index + 1];
    const z = positions[index + 2];

    const jitter = 0.02;
    pointPositions[index] = x + (Math.random() - 0.5) * jitter;
    pointPositions[index + 1] = y + (Math.random() - 0.5) * jitter;
    pointPositions[index + 2] = 1;

    initialPositions[index] = pointPositions[index];
    initialPositions[index + 1] = pointPositions[index + 1];
    initialPositions[index + 2] = 1;

    velocities[index] = Math.random() * 0.01;
    velocities[index + 1] = (Math.random() - 0.5) * 0.01;
    velocities[index + 2] = (Math.random() - 0.5) * 0.01;

    initialY[i] = positions[i + 1];

    velocities[i] = Math.random() * 0.01;
    velocities[i + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i + 2] = (Math.random() - 0.5) * 0.01;

    opacities[i] = 0;
    const shouldBeVisible = Math.random() > 0.4;
    opacities[i] = shouldBeVisible ? 0 : -1;
  }

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(pointPositions, 3)
  );
  pointGeometry.setAttribute(
    "velocities",
    new THREE.BufferAttribute(velocities, 3)
  );
  pointGeometry.setAttribute(
    "initialPositions",
    new THREE.BufferAttribute(initialPositions, 3)
  );
  pointGeometry.setAttribute(
    "columnIndex",
    new THREE.BufferAttribute(columnIndices, 1)
  );
  pointGeometry.setAttribute(
    "pointOpacity",
    new THREE.BufferAttribute(opacities, 1)
  );
  pointGeometry.setAttribute(
    "initialY",
    new THREE.BufferAttribute(initialY, 1)
  );
  pointGeometry.setAttribute("bounds", new THREE.BufferAttribute(bounds, 1));

  return pointGeometry;
}

export function getShapesFromSVG() {
  return new Promise((resolve, reject) => {
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
          shapes.forEach((shape) => {
            const geometry = new THREE.ShapeGeometry(shape);
            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
          });
        }

        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());

        resolve(group);
      },
      function (xhr) {
        console.log("loading");
      },
      function (error) {
        console.log("An error happened");
      }
    );
  });
}
