// the cube is the only model in the project
// its corners sit at plus or minus one so it is two units wide on every side
// six faces with two triangles each and three vertices per triangle gives thirty six vertices
// every vertex also stores the normal of its face

const FACES = [
  // each face has a normal and four corners
  // top
  [[0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]],
  // bottom
  [[0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]]],
  // front
  [[0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]],
  // back
  [[0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]],
  // right
  [[1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]],
  // left
  [[-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]],
];

// split every face into two triangles
const CUBE = [];
for (const [normal, c] of FACES) {
  for (const i of [0, 1, 2, 0, 2, 3]) CUBE.push({ pos: c[i], normal });
}
