export default function (time, animationTime, points) {
  // Scale these values based on animation time
  const baseSpeed = 0.000005 * (1000 / animationTime);
  const acceleration = 0.000004 * (1000 / animationTime);
  const maxSpeed = 0.005 * (1000 / animationTime);

  // Wave motion scaling
  const waveSpeed = 0.001 * (1000 / animationTime);
  const waveAmplitude = 0.001 * (1000 / animationTime);
  const velocityScale = 0.01 * (1000 / animationTime);
  const verticalVelocityScale = 0.04 * (1000 / animationTime);

  const positions = points.geometry.attributes.position.array;
  const velocities = points.geometry.attributes.velocities.array;
  const initialPositions = points.geometry.attributes.initialPositions.array;
  const opacities = points.geometry.attributes.pointOpacity.array;

  const effectProgress = time / animationTime;
  // Scale particle delay based on animation time
  const particleDelay = 0.01 * (1000 / animationTime);

  for (let i = 0; i < opacities.length; i++) {
    if (opacities[i] === -1) continue;
    const positionIndex = i * 3;
    const distanceTravelled = Math.abs(
      positions[positionIndex] - initialPositions[positionIndex]
    );

    const xRange = Math.abs(
      Math.max(...initialPositions) - Math.min(...initialPositions)
    );
    const xProgress =
      (initialPositions[positionIndex] - Math.min(...initialPositions)) /
      xRange;

    if (xProgress < effectProgress - particleDelay) {
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
      const waveStartDistance = 1.5; // Adjust this value to control when the wave starts
      const waveStrength = Math.min(
        Math.max(0, (distanceTravelled - waveStartDistance) / 0.1),
        1.0
      );

      positions[positionIndex + 1] +=
        velocities[positionIndex + 1] * verticalVelocityScale +
        Math.sin(positions[positionIndex] * 2 + time * waveSpeed) *
          waveAmplitude *
          waveStrength;
    }
  }

  points.geometry.attributes.position.needsUpdate = true;
  points.geometry.attributes.pointOpacity.needsUpdate = true;
}
