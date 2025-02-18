export default function (
  effectProgress,
  width,
  time,
  animationTime,
  attributes
) {
  const timeScale = (1000 / animationTime) * (10 / width);

  const motion = {
    base: {
      speed: 0.00003 * timeScale,
      acceleration: 0.00005 * timeScale,
      maxSpeed: 0.4 * timeScale,
    },
    wave: {
      speed: 0.00001 * timeScale,
      amplitude: 0.006 * timeScale,
      startDistance: 1.5,
    },
    velocity: {
      horizontal: 0.3 * timeScale,
      vertical: 0.15 * timeScale,
    },
  };

  const {
    position: { array: positions },
    velocities: { array: velocities },
    initialPositions: { array: initialPositions },
    pointOpacity: { array: opacities },
    bounds: { array: bounds },
  } = attributes;

  const [minX, , xRange] = bounds;

  const particleDelay = 0.01 * timeScale;
  const fadeOutStart = 2.5; // Start fading at 2x animation time

  for (let i = 0; i < opacities.length; i++) {
    if (opacities[i] === -1) continue;

    const positionIndex = i * 3;
    const distanceTravelled = Math.abs(
      positions[positionIndex] - initialPositions[positionIndex]
    );
    const xProgress = (initialPositions[positionIndex] - minX) / xRange;

    if (xProgress < effectProgress - particleDelay) {
      opacities[i] = Math.min(opacities[i] + 0.015, 0.8);

      // Fade out after 2x animation time
      if (time > animationTime * fadeOutStart) {
        opacities[i] = opacities[i] - 0.02;
      }
    }

    if (opacities[i] > 0.2) {
      const speed = Math.min(
        Math.sqrt(2 * motion.base.acceleration * distanceTravelled),
        motion.base.maxSpeed
      );

      positions[positionIndex] +=
        speed + velocities[positionIndex] * motion.velocity.horizontal;

      const waveStrength = Math.min(
        Math.max(0, (distanceTravelled - motion.wave.startDistance) / 0.1),
        1.0
      );

      const phaseOffset = i * 0.5; // You can adjust this multiplier to control the variation
      positions[positionIndex + 1] +=
        velocities[positionIndex + 1] * motion.velocity.vertical +
        Math.sin(
          positions[positionIndex] * 0.5 +
            time * motion.wave.speed +
            phaseOffset
        ) *
          motion.wave.amplitude *
          waveStrength;
    }
  }

  attributes.position.needsUpdate = true;
  attributes.pointOpacity.needsUpdate = true;
}
