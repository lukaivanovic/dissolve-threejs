import * as THREE from "three";

export default function (geometry) {
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

    // Get vertex position
    const x = positions[index];
    const y = positions[index + 1];
    const z = positions[index + 2];

    // Add some randomization for more natural look
    const jitter = 0.02; // Adjust this value to control spread
    pointPositions[index] = x + (Math.random() - 0.5) * jitter;
    pointPositions[index + 1] = y + (Math.random() - 0.5) * jitter;
    pointPositions[index + 2] = 1;

    initialPositions[index] = pointPositions[index];
    initialPositions[index + 1] = pointPositions[index + 1];
    initialPositions[index + 2] = 1;

    velocities[index] = Math.random() * 0.01; // x velocity
    velocities[index + 1] = (Math.random() - 0.5) * 0.01; // y velocity - upward drift
    velocities[index + 2] = (Math.random() - 0.5) * 0.01; // z velocity for depth

    initialY[i] = positions[i + 1];

    velocities[i] = Math.random() * 0.01; // x velocity
    velocities[i + 1] = (Math.random() - 0.5) * 0.02; // y velocity - upward drift
    velocities[i + 2] = (Math.random() - 0.5) * 0.01; // z velocity for depth

    opacities[i] = 0;
    const shouldBeVisible = Math.random() > 0.4; // 70% of points will be visible
    opacities[i] = shouldBeVisible ? 0 : -1; // Use -1 to mark permanently hidden points
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
