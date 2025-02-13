import * as THREE from "three";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";

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

const pointMaterial = new THREE.ShaderMaterial({
  uniforms: {
    globalOpacity: { value: 1.0 },
    particleSize: { value: 2.0 }, // Reduced size for more delicate particles
  },
  vertexShader: `
      attribute float pointOpacity;
      uniform float particleSize;
      varying float vOpacity;
      
      void main() {
          vOpacity = pointOpacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          // Add distance-based size variation
          gl_PointSize = particleSize * (1.0 / -mvPosition.z) * (0.8 + 0.4 * vOpacity);
      }
  `,
  fragmentShader: `
      uniform float globalOpacity;
      varying float vOpacity;

      void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Softer particle appearance
          float strength = 1.0 - smoothstep(0.2, 0.5, dist);
          
          float finalAlpha = strength * vOpacity * globalOpacity;
          // Add slight color variation
          gl_FragColor = vec4(1.0, 0.98, 0.95, finalAlpha);
      }
  `,
  transparent: true,
  depthWrite: false,
});

const dissolveMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    threshold: { value: 0 },
  },
  vertexShader: `
          varying vec2 vUv;
          void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
      `,
  fragmentShader: `
          uniform float threshold;
          varying vec2 vUv;
          
          void main() {
              float mask = vUv.x;
              float lineWidth = 0.05;
              float alpha = smoothstep(threshold - lineWidth, threshold + lineWidth, mask);
              gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
          }
      `,
  transparent: true,
});

function createGridPoints(width, height, segments) {
  const totalPoints = segments * segments;
  const positions = new Float32Array(segments * segments * 3);
  const velocities = new Float32Array(segments * segments * 3);
  const initialPositions = new Float32Array(segments * segments * 3);
  const columnIndices = new Float32Array(segments * segments);
  const opacities = new Float32Array(segments * segments);

  for (let i = 0; i < totalPoints; i++) {
    const col = i % segments;
    const row = Math.floor(i / segments);
    const index = i * 3;

    positions[index] = (col / (segments - 1) - 0.5) * width;
    positions[index + 1] = (row / (segments - 1) - 0.5) * height;

    initialPositions[index] = (col / (segments - 1) - 0.5) * width;
    initialPositions[index + 1] = (row / (segments - 1) - 0.5) * height;

    velocities[index] = Math.random() * 0.02; // x velocity
    velocities[index + 1] = (Math.random() - 0.5) * 0.02; // y velocity - upward drift
    velocities[index + 2] = (Math.random() - 0.5) * 0.01; // z velocity for depth

    columnIndices[i] = col;
    opacities[i] = 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("velocities", new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute(
    "initialPositions",
    new THREE.BufferAttribute(initialPositions, 3)
  );
  geometry.setAttribute(
    "columnIndex",
    new THREE.BufferAttribute(columnIndices, 1)
  );
  geometry.setAttribute(
    "pointOpacity",
    new THREE.BufferAttribute(opacities, 1)
  );
  return geometry;
}

const pointsGeometry = createGridPoints(1, 1, 20);
const points = new THREE.Points(pointsGeometry, pointMaterial);
scene.add(points);

const squareGeometry = new THREE.PlaneGeometry(1, 1.1);
const square = new THREE.Mesh(squareGeometry, dissolveMaterial);
scene.add(square);

camera.position.z = 5;

const pane = new Pane();

const params = {
  time: 0,
  animationTime: 400,
  isPlaying: true,
  reset: () => {
    params.time = 0;

    const pointsGeometry = createGridPoints(1, 1, 20);
    const points = new THREE.Points(pointsGeometry, pointMaterial);
    scene.add(points);

    const squareGeometry = new THREE.PlaneGeometry(1, 1.1);
    const square = new THREE.Mesh(squareGeometry, dissolveMaterial);
    scene.add(square);
  },
};

const btn = pane.addButton({
  title: "Reset",
  label: "Reset", // optional
});

btn.on("click", () => {
  window.location.reload();
});

function animate() {
  if (!params.isPlaying) return;
  params.time += 1;
  // Scale these values based on animation time
  const baseSpeed = 0.00001 * (1000 / params.animationTime);
  const acceleration = 0.000004 * (1000 / params.animationTime);
  const maxSpeed = 0.005 * (1000 / params.animationTime);

  // Wave motion scaling
  const waveSpeed = 0.001 * (1000 / params.animationTime);
  const waveAmplitude = 0.001 * (1000 / params.animationTime);
  const velocityScale = 0.01 * (1000 / params.animationTime);
  const verticalVelocityScale = 0.04 * (1000 / params.animationTime);

  const positions = points.geometry.attributes.position.array;
  const velocities = points.geometry.attributes.velocities.array;
  const initialPositions = points.geometry.attributes.initialPositions.array;
  const columnIndices = points.geometry.attributes.columnIndex.array;
  const opacities = points.geometry.attributes.pointOpacity.array;

  const effectProgress = params.time / params.animationTime;
  // Scale particle delay based on animation time
  const particleDelay = 0.01 * (1000 / params.animationTime);

  for (let i = 0; i < opacities.length; i++) {
    const positionIndex = i * 3;
    const distanceTravelled = Math.abs(
      positions[positionIndex] - initialPositions[positionIndex]
    );
    const columnProgress = columnIndices[i] / 20;

    if (columnProgress < effectProgress - particleDelay) {
      opacities[i] = Math.min(opacities[i] + 0.015, 1.0);
    }

    if (opacities[i] > 0.2) {
      const speed = Math.min(
        Math.sqrt(2 * acceleration * distanceTravelled),
        maxSpeed
      );

      positions[positionIndex] +=
        speed + velocities[positionIndex] * velocityScale;

      // Add wave motion only after traveling a certain distance
      const waveStartDistance = 0.1; // Adjust this value to control when the wave starts
      const waveStrength = Math.min(
        Math.max(0, (distanceTravelled - waveStartDistance) / 0.1),
        1.0
      );
      positions[positionIndex + 1] +=
        velocities[positionIndex + 1] * verticalVelocityScale +
        Math.sin(positions[positionIndex] * 2 + params.time * waveSpeed) *
          waveAmplitude *
          waveStrength;
    }
  }

  dissolveMaterial.uniforms.threshold.value = effectProgress;
  points.geometry.attributes.position.needsUpdate = true;
  points.geometry.attributes.pointOpacity.needsUpdate = true;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
