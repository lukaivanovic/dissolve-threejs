import * as THREE from "three";

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
    particleSize: { value: 3.0 }, // Adjustable size
  },
  vertexShader: `
      attribute float pointOpacity;
      uniform float particleSize;
      varying float vOpacity;
      
      void main() {
          vOpacity = pointOpacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = particleSize * (1.0 / -mvPosition.z);
      }
  `,
  fragmentShader: `
      uniform float globalOpacity;
      varying float vOpacity;

      void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          float strength = 1.0 - smoothstep(0.3, 0.5, dist);
          
          float finalAlpha = strength * vOpacity * globalOpacity;
          gl_FragColor = vec4(1.0, 1.0, 1.0, finalAlpha);
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
    velocities[index + 1] = (Math.random() - 0.5) * 0.01; // y velocity - upward drift

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

const params = {
  time: 0,
  animationTime: 2000,
};

function animate() {
  params.time += 1;
  const baseSpeed = 0.00001;
  const acceleration = 0.000001;
  const maxSpeed = 0.001;

  const positions = points.geometry.attributes.position.array;
  const velocities = points.geometry.attributes.velocities.array;
  const initialPositions = points.geometry.attributes.initialPositions.array;
  const columnIndices = points.geometry.attributes.columnIndex.array;
  const opacities = points.geometry.attributes.pointOpacity.array;

  const effectProgress = params.time / params.animationTime;
  const particleDelay = 0.02;

  for (let i = 0; i < opacities.length; i++) {
    const positionIndex = i * 3;
    const distanceTravelled = Math.abs(
      positions[positionIndex] - initialPositions[positionIndex]
    );
    const columnProgress = columnIndices[i] / 20;

    if (columnProgress < effectProgress - particleDelay) {
      opacities[i] = Math.min(opacities[i] + 0.01, 1.0); // Cap opacity
    }

    if (opacities[i] > 0.2) {
      const speed = Math.min(
        Math.sqrt(2 * acceleration * distanceTravelled),
        maxSpeed
      );
      positions[positionIndex] += speed + velocities[positionIndex] * 0.01;
      positions[positionIndex + 1] += velocities[positionIndex + 1] * 0.04;
    }
  }

  dissolveMaterial.uniforms.threshold.value = effectProgress;
  points.geometry.attributes.position.needsUpdate = true;
  points.geometry.attributes.pointOpacity.needsUpdate = true;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
