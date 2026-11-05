// the landscape is a grid of cubes on the x z plane
// each cube gets a model matrix that translates it to its grid cell and scales it to its height
// that matrix is applied to the cube vertices here in javascript
// then every cube goes into one big buffer so the whole landscape is drawn with one draw call

// the grid covers x and z from negative twenty to twenty
const SIZE = 40;

// level two sampling
// the image is shrunk to one pixel per cube on a hidden canvas
// the browser averages the pixels it shrinks together so each cube gets the average color of its patch
// then get image data reads the pixels as red green blue alpha numbers
function sampleImage(img, N) {
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, N, N);
  return ctx.getImageData(0, 0, N, N).data;
}

// level one c procedure that picks a color from a height
function colorForHeight(h) {
  // water
  if (h < 2) return [0.2, 0.4, 0.8];
  // sand
  if (h < 3) return [0.85, 0.8, 0.5];
  // grass
  if (h < 6) return [0.3, 0.65, 0.25];
  // rock
  if (h < 7.5) return [0.5, 0.5, 0.5];
  // snow
  return [0.95, 0.95, 0.95];
}

// build every cube for the chosen level and grid size
function buildLandscape(level, N) {
  const positions = [], colors = [], normals = [];
  const cell = SIZE / N;
  let heightData, colorData;
  if (level >= 2) {
    heightData = sampleImage(heightImage, N);
    colorData = sampleImage(colorImage, N);
  }

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = -SIZE / 2 + (i + 0.5) * cell;
      const z = -SIZE / 2 + (j + 0.5) * cell;
      let h, top, bottom;

      if (level === '1a') {
        // flat grid with one color
        h = 1;
        top = bottom = [0.3, 0.65, 0.25];
      } else if (level === '1b') {
        // heights from sine waves plus random numbers with one color
        h = 4 + 3 * Math.sin(x * 0.3) * Math.cos(z * 0.25) + Math.random();
        top = bottom = [0.3, 0.65, 0.25];
      } else if (level === '1c' || level === '1d') {
        // same heights plus vertex colors with the top colored by height and the bottom dirt brown
        h = 4 + 3 * Math.sin(x * 0.3) * Math.cos(z * 0.25) + Math.random();
        top = colorForHeight(h);
        bottom = [0.35, 0.22, 0.1];
      } else {
        // level two and up read the height and color from the images
        const k = (j * N + i) * 4;
        // a gray value from zero to two hundred fifty five becomes a height from one half to twelve and a half
        h = 0.5 + (heightData[k] / 255) * 12;
        top = [colorData[k] / 255, colorData[k + 1] / 255, colorData[k + 2] / 255];
        // the bottom is a darker version of the top
        bottom = top.map((c) => c * 0.35);
      }

      // scale the cube to the cell size and height then translate it up by half its height so it sits on the ground
      const model = multiply(translate(x, h / 2, z), scale(cell / 2, h / 2, cell / 2));
      for (const v of CUBE) {
        positions.push(...transformPoint(model, v.pos));
        // top corners get the top color and bottom corners get the bottom color
        colors.push(...(v.pos[1] > 0 ? top : bottom));
        normals.push(...v.normal);
      }
    }
  }
  return makeMesh(positions, colors, normals);
}
