export default function (time, animationTime, attributes) {
  const timeScale = 1000 / animationTime;

  const motion = {
    base: {
      speed: 0.000005 * timeScale,
      acceleration: 0.000004 * timeScale,
      maxSpeed: 0.005 * timeScale,
    },
    wave: {
      speed: 0.001 * timeScale,
      amplitude: 0.001 * timeScale,
      startDistance: 1.5,
    },
    velocity: {
      horizontal: 0.01 * timeScale,
      vertical: 0.04 * timeScale,
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
  const effectProgress = time / animationTime;
  const particleDelay = 0.01 * timeScale;

  for (let i = 0; i < opacities.length; i++) {
    if (opacities[i] === -1) continue;

    const positionIndex = i * 3;
    const distanceTravelled = Math.abs(
      positions[positionIndex] - initialPositions[positionIndex]
    );
    const xProgress = (initialPositions[positionIndex] - minX) / xRange;

    if (xProgress < effectProgress - particleDelay) {
      opacities[i] = Math.min(opacities[i] + 0.015, 1.0);
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

      positions[positionIndex + 1] +=
        velocities[positionIndex + 1] * motion.velocity.vertical +
        Math.sin(positions[positionIndex] * 2 + time * motion.wave.speed) *
          motion.wave.amplitude *
          waveStrength;
    }
  }

  attributes.position.needsUpdate = true;
  attributes.pointOpacity.needsUpdate = true;
}
