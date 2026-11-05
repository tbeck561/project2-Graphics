// levels and buttons and the animation loop

// the text shown for each level
const INFO = {
  '0': 'Level 0: a single 2×2×2 cube.',
  '1a': 'Level 1a: cubes TRANSLATED into a grid on the x-z plane. Try the grid sizes.',
  '1b': 'Level 1b: each cube SCALED in y. Heights come from sine waves plus random numbers.',
  '1c': 'Level 1c: top vertices are colored by height, bottom vertices brown. The GPU blends the colors in between.',
  '1d': 'Level 1d: the camera circles the world while looking at (0, 0, 0).',
  '2': 'Level 2: cube heights from a grayscale height map, colors from a color map.',
  '3': 'Level 3: clouds, a blimp and birds built from cubes. The blimp and birds fly along Bézier curves.',
  '4': 'Level 4: sun lighting (Lambert) and distance fog.',
};

// the two images for level two
const heightImage = new Image();
const colorImage = new Image();
heightImage.src = 'assets/heightmap.png';
colorImage.src = 'assets/colormap.png';

let level = '0';
let landscape = null;

// turns a level name into its number so one a becomes one
const levelNumber = () => parseInt(level, 10);

// rebuild the landscape when the level or the grid size changes
function rebuild() {
  document.getElementById('info').textContent = INFO[level];
  document.getElementById('resolution').disabled = level === '0';
  if (level === '0') {
    landscape = null;
    return;
  }
  const N = Number(document.getElementById('resolution').value);
  try {
    landscape = buildLandscape(levelNumber() >= 2 ? levelNumber() : level, N);
  } catch (e) {
    landscape = null;
    document.getElementById('info').textContent =
      'Could not read the images. Open this page from a web server (see README), not by double-clicking the file.';
  }
}

// level buttons
document.querySelectorAll('#levels button').forEach((button) => {
  button.addEventListener('click', () => {
    level = button.dataset.level;
    document.querySelectorAll('#levels button').forEach((b) => b.classList.toggle('active', b === button));
    rebuild();
  });
});

// grid size menu
document.getElementById('resolution').addEventListener('change', rebuild);

// sky blue background
const SKY = [0.6, 0.8, 1.0];

// draw one frame and ask the browser for the next one
function render(ms) {
  const time = ms / 1000;
  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...SKY, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  // the camera stays still until level one d and then it circles around the center
  let eye;
  if (level === '0') eye = [4, 3, 5];
  else if (level === '1a' || level === '1b' || level === '1c') eye = [30, 26, 30];
  else {
    const angle = time * 0.2;
    eye = [45 * Math.cos(angle), 28, 45 * Math.sin(angle)];
  }
  gl.uniformMatrix4fv(loc.uView, false, lookAt(eye, [0, 0, 0], [0, 1, 0]));
  gl.uniformMatrix4fv(loc.uProjection, false, perspective(60, canvas.width / canvas.height, 0.1, 500));
  gl.uniform3fv(loc.uCamera, eye);
  gl.uniform3fv(loc.uSky, SKY);
  gl.uniform1i(loc.uLighting, level === '4' ? 1 : 0);

  if (level === '0') drawMesh(singleCube, identity(), [1, 1, 1]);
  else if (landscape) drawMesh(landscape, identity(), [1, 1, 1]);
  if (levelNumber() >= 3) drawSky(time);

  requestAnimationFrame(render);
}

// start once both images have loaded because level two needs them
let loaded = 0;
for (const img of [heightImage, colorImage]) {
  img.onload = () => {
    loaded++;
    if (loaded === 2) {
      rebuild();
      requestAnimationFrame(render);
    }
  };
}
