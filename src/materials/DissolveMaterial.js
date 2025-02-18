import * as THREE from "three";

export default new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    threshold: { value: 0 },
    min: { value: 0 },
    max: { value: 10 },
  },
  vertexShader: `
            uniform float min; // 0
            uniform float max; // 10
            varying vec2 vUv;

            void main() {
                vUv.x =  (position.x - min) / (max - min);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
  fragmentShader: `
            uniform float threshold;
            varying vec2 vUv;
            
            void main() {
                float mask = vUv.x;
                float lineWidth = 0.04;
                float alpha = smoothstep(threshold - lineWidth, threshold + lineWidth, mask);
                gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
            }
        `,
  transparent: true,
});
