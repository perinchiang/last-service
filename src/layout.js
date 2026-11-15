// Shared landmarks: architecture, interaction, navigation and QA use the same hall.
export const HALL = Object.freeze({
 halfWidth: 10.8, back: 14, front: -26, height: 9.2,
 bays: [10, 4, -2, -8, -14, -20, -26],
 gate: {z: -25.5, halfWidth: 3.2, height: 6.6, travel: 3.35},
 terminal: {x: -4.9, z: -21.4},
 cargo: {x: -5.6, z: -3.4, y: 4.4},
 waves: [
  [[-5.5,2.7,-17.5],[5.7,3,-19],[0,4.2,-20.5]],
  [[-5.6,3.1,-5],[5.8,3.2,-7],[-2.8,3.8,-12]]
 ]
});
export const movementBounds = open => ({x:HALL.halfWidth-.6,zMin:open?HALL.gate.z-3.5:HALL.gate.z+1.1,zMax:HALL.back-.8});
