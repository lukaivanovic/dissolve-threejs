import * as THREE from "three";

export default function (geometry) {
  // Get vertices from geometry
  const positions = geometry.attributes.position.array;
  const vertexCount = positions.length / 3;

  // Create arrays for our points data
  const pointPositions = [];
  const pointOpacities = [];

  for (let i = 0; i < vertexCount; i++) {
    // Get vertex position
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // Add some randomization for more natural look
    const jitter = 0.02; // Adjust this value to control spread
    pointPositions.push(
      x + (Math.random() - 0.5) * jitter,
      y + (Math.random() - 0.5) * jitter,
      z + (Math.random() - 0.5) * jitter
    );

    // Initialize opacity to 0
    pointOpacities.push(Math.random() > 0.2 ? 0 : -1); // Some points stay invisible
  }

  // Create buffer geometry for points
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(pointPositions, 3)
  );
  pointsGeometry.setAttribute(
    "pointOpacity",
    new THREE.Float32BufferAttribute(pointOpacities, 1)
  );

  return pointsGeometry;
}
