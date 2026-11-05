// the sky for level three
// clouds and a blimp and birds are all made of scaled and rotated and translated cubes
// the blimp and the birds fly along cubic bezier curves

// cubic bezier curve with four control points
// the weights are the bernstein polynomials of t
function bezier(P, t) {
  const u = 1 - t;
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [0, 1, 2].map((k) => w[0] * P[0][k] + w[1] * P[1][k] + w[2] * P[2][k] + w[3] * P[3][k]);
}

// control points for each path
const BLIMP_PATH = [[-45, 18, -10], [-15, 26, 25], [15, 12, -25], [45, 20, 10]];
const BIRD_PATHS = [
  [[-40, 14, 20], [-10, 22, -20], [10, 8, 30], [40, 16, -15]],
  [[35, 15, 30], [10, 24, 0], [-5, 10, -35], [-40, 18, -20]],
];

// where each cloud sits
const CLOUDS = [[-12, 20, -8], [10, 22, 12], [2, 21, -18], [-18, 23, 14]];

// draw one cube inside a parent object
// the size is the full width and height and depth
function cube(parent, x, y, z, w, h, d, color) {
  drawMesh(unitCube, multiply(parent, multiply(translate(x, y, z), scale(w / 2, h / 2, d / 2))), color);
}

// find the spot on the path and turn the object to face the way it is moving
// t goes from zero to one and then starts over so a far away object jumps back to its start
function followPath(path, t) {
  const p = bezier(path, t);
  const ahead = bezier(path, Math.min(t + 0.01, 1));
  const angle = Math.atan2(-(ahead[2] - p[2]), ahead[0] - p[0]);
  return multiply(translate(...p), rotateY(angle));
}

function drawSky(time) {
  // clouds do not move
  const none = identity();
  for (const [x, y, z] of CLOUDS) {
    cube(none, x, y, z, 8, 1.2, 5, [1, 1, 1]);
    cube(none, x + 3, y + 0.6, z + 1, 5, 1.2, 3, [1, 1, 1]);
  }

  // the blimp
  const blimp = followPath(BLIMP_PATH, (time / 25) % 1);
  // body
  cube(blimp, 0, 0, 0, 8, 2, 2, [0.85, 0.85, 0.9]);
  // tail fin
  cube(blimp, -4.2, 1, 0, 1.5, 1.6, 0.2, [0.8, 0.2, 0.2]);
  // gondola
  cube(blimp, 0.5, -1.3, 0, 2, 0.6, 0.8, [0.4, 0.3, 0.2]);

  // the birds
  BIRD_PATHS.forEach((path, k) => {
    const bird = followPath(path, (time / 12 + k * 0.5) % 1);
    const flap = Math.sin(time * 10 + k) * 0.6;
    // body
    cube(bird, 0, 0, 0, 1, 0.4, 0.4, [0.2, 0.2, 0.25]);
    for (const side of [1, -1]) {
      // each wing rotates around the body to flap
      const wing = multiply(bird, rotateX(side * flap));
      cube(wing, 0, 0, side * 0.6, 0.5, 0.1, 0.9, [0.3, 0.3, 0.35]);
    }
  });
}
