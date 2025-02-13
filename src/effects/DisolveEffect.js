import createParticlesFromGeometry from "../util/createParticlesFromGeometry";
import ParticleMaterial from "../materials/ParticleMaterial";
import * as THREE from "three";

// effects/DissolveEffect.js
export default class DissolveEffect {
  constructor(geometry, options = {}) {
    this.options = {
      density: options.density || 20,
      animationDuration: options.animationDuration || 400,
      particleSize: options.particleSize || 4.0,
      ...options,
    };

    this.time = 0;
    this.pointsGeometry = createParticlesFromGeometry(
      geometry,
      this.options.density
    );
    this.particleMaterial = ParticleMaterial;

    this.points = new THREE.Points(this.pointsGeometry, this.particleMaterial);
  }

  update(deltaTime) {
    this.time += deltaTime;
    const progress = this.time / this.options.animationDuration;

    this.particleMaterial.updateTime(this.time);
    this.updateParticles(progress);
  }

  updateParticles(progress) {
    const opacities = this.pointsGeometry.attributes.pointOpacity;
    const positions = this.pointsGeometry.attributes.position;

    for (let i = 0; i < opacities.count; i++) {
      if (opacities.array[i] === -1) continue;

      // Update opacity based on progress
      opacities.array[i] = Math.min(opacities.array[i] + 0.015, 1.0);

      // Add movement
      if (opacities.array[i] > 0.2) {
        positions.array[i * 3] += 0.01;
      }
    }

    opacities.needsUpdate = true;
    positions.needsUpdate = true;
  }

  getMesh() {
    return this.points;
  }
}
