import * as THREE from "three";

export default function getPoints(shape, numPoints = 50) {
  // Check if input is a valid THREE.Shape or THREE.Path
  if (!(shape instanceof THREE.Shape) && !(shape instanceof THREE.Path)) {
    throw new Error("Input must be a THREE.Shape or THREE.Path");
  }

  // Get equally distributed points along the shape
  const points = shape.getSpacedPoints(numPoints);
  console.log(points);

  // Convert points to regular array of Vector2
  return points.map((point) => new THREE.Vector2(point.x, point.y));
}
