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
    globalOpacity: { value: 1.0 }, // Optional global opacity multiplier
  },
  vertexShader: `
      attribute float pointOpacity;
      varying float vOpacity;
      
      void main() {
          vOpacity = pointOpacity;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 2.0;
      }
  `,
  fragmentShader: `
      uniform float globalOpacity;
      varying float vOpacity;

      void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          float strength = 1.0 - smoothstep(0.45, 0.5, dist);
          
          // Combine point-specific opacity with global opacity
          gl_FragColor = vec4(1.0, 1.0, 1.0, strength * vOpacity * globalOpacity);
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
  const columnIndices = new Float32Array(segments * segments);
  const opacities = new Float32Array(segments * segments);

  for (let i = 0; i < totalPoints; i++) {
    const col = i % segments;
    const row = Math.floor(i / segments);
    const index = i * 3;

    positions[index] = (col / (segments - 1) - 0.5) * width;
    positions[index + 1] = (row / (segments - 1) - 0.5) * height;
    positions[index + 2] = 0;

    velocities[index] = (Math.random() * 0.2 + 0.8) * 0.01;
    velocities[index + 1] = (Math.random() - 0.7) * 0.005;
    velocities[index + 2] = 0;
    columnIndices[i] = col;

    opacities[i] = 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
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

const squareGeometry = new THREE.PlaneGeometry(1, 0.5);
const square = new THREE.Mesh(squareGeometry, dissolveMaterial);
scene.add(square);

camera.position.z = 5;

const params = {
  time: 0.0,
  animationTime: 10.0,
};

function animate() {
  const effectProgress = params.time / params.animationTime;
  params.time += 0.01;
  const positions = points.geometry.attributes.position.array;
  const velocities = points.geometry.attributes.velocity.array;
  const columnIndices = points.geometry.attributes.columnIndex.array;
  const opacities = points.geometry.attributes.pointOpacity.array;

  const activeColumn = Math.floor(params.time * 1);

  for (let i = 0; i < opacities.length; i++) {
    const positionIndex = i * 3;

    const normalizedColumnPosition = columnIndices[i] / 20;
    const distanceFromLine = normalizedColumnPosition - effectProgress;
    const transitionZone = 0.05;

    if (distanceFromLine < transitionZone) {
      const activation = 1.0 - distanceFromLine / transitionZone;
      opacities[i] = Math.min(opacities[i] + 0.01 * activation, 1.0);

      // Use all velocity components
      positions[positionIndex] += velocities[positionIndex] * activation;
      positions[positionIndex + 1] +=
        velocities[positionIndex + 1] * activation;
      positions[positionIndex + 2] +=
        velocities[positionIndex + 2] * activation;
    }

    /*

    if (columnIndices[i] / 20 < effectProgress - 0.1) {
      opacities[i] += 0.01;
      positions[positionIndex] += 1 / effectProgress;
      
    }
      */
  }

  dissolveMaterial.uniforms.threshold.value = effectProgress;
  points.geometry.attributes.position.needsUpdate = true;
  points.geometry.attributes.pointOpacity.needsUpdate = true;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// const normalizedX = (positions[positionIndex] + 0.5); // assuming width is 1
// Create a transition zone around the dissolve line

/*
    const transitionWidth = 0.3;
    const distanceFromLine = positions[positionIndex] - effectProgress;

    if (distanceFromLine < transitionWidth) {
      // Smoothly activate points near the line
      const activation = 3.0 - distanceFromLine / transitionWidth;
      opacities[i] = Math.min(opacities[i] + 0.1 * activation, 1.0);

      // Scale velocity based on proximity to the line
      const velocityScale = activation;
      positions[positionIndex] += velocities[positionIndex];
      positions[positionIndex + 1] += velocities[positionIndex + 1];
    }
    */

// positions[positionIndex + 1] += velocities[positionIndex + 1];
