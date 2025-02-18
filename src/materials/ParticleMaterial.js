import * as THREE from "three";

export default new THREE.ShaderMaterial({
  uniforms: {
    globalOpacity: { value: 1.0 },
    particleSize: { value: 140.0 },
    time: { value: 0 },
  },
  vertexShader: `
        attribute float pointOpacity;
        attribute float initialY;
        uniform float particleSize;
        uniform float time;
        varying float vOpacity;
        varying vec2 vRotation;  // Add rotation varying
        
        void main() {
            vOpacity = pointOpacity;
            vec3 pos = position;
            
            // Enhanced swirl and rotation effect
            float swirl = sin(time * 0.001 + initialY * 2.0) * 0.02;
            float rotation = time * 0.001 + initialY * 3.0;  // Rotation angle
            vRotation = vec2(sin(rotation), cos(rotation));  // Pass rotation to fragment shader
            
            pos.x += swirl;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = particleSize * (1.0 / -mvPosition.z) * (0.5 + 0.7 * vOpacity);
        }
    `,
  fragmentShader: `
        uniform float globalOpacity;
        varying float vOpacity;
        varying vec2 vRotation;  // Receive rotation varying
  
        void main() {
            // Rotate point coordinates
            vec2 center = gl_PointCoord - vec2(0.5);
            vec2 rotated = vec2(
                center.x * vRotation.y - center.y * vRotation.x,
                center.x * vRotation.x + center.y * vRotation.y
            );
            
            // Create sharper diamond-like shape
            float dist = max(abs(rotated.x), abs(rotated.y)) * 1.5;
            
            // Sharper falloff
            float strength = 1.0 - smoothstep(0.2, 0.4, dist);
            
            float finalAlpha = strength * vOpacity * globalOpacity;
            vec3 color = mix(
                vec3(1.0, 0.95, 0.8),
                vec3(0.9, 0.95, 1.0),
                vOpacity * 0.3
            );
            
            // Add subtle glow
            color *= 1.0 + (1.0 - dist) * 0.2;
            
            gl_FragColor = vec4(color, finalAlpha);
        }
    `,
  // ... existing code ...

  transparent: true,
  depthWrite: false,
});
