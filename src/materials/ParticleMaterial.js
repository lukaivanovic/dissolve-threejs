import * as THREE from "three";

export default new THREE.ShaderMaterial({
  uniforms: {
    globalOpacity: { value: 1.0 },
    particleSize: { value: 4.0 },
    time: { value: 0 }, // Add time uniform for particle animation
  },
  vertexShader: `
        attribute float pointOpacity;
        attribute float initialY;  // Add initial Y position
        uniform float particleSize;
        uniform float time;
        varying float vOpacity;
        
        void main() {
            vOpacity = pointOpacity;
            vec3 pos = position;
            
            // Add subtle swirl based on height and time
            float swirl = sin(time * 0.001 + initialY * 2.0) * 0.02;
            pos.x += swirl;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            // Vary size based on opacity and movement
            gl_PointSize = particleSize * (1.0 / -mvPosition.z) * (0.6 + 0.6 * vOpacity);
        }
    `,
  fragmentShader: `
        uniform float globalOpacity;
        varying float vOpacity;
  
        void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            
            // Create softer, more ethereal particles
            float strength = 1.0 - smoothstep(0.1, 0.5, dist);
            
            float finalAlpha = strength * vOpacity * globalOpacity;
            // Add more dramatic color variation
            vec3 color = mix(
                vec3(1.0, 0.95, 0.8),  // Warm color
                vec3(0.9, 0.95, 1.0),   // Cool color
                vOpacity * 0.3
            );
            gl_FragColor = vec4(color, finalAlpha);
        }
    `,
  transparent: true,
  depthWrite: false,
});
