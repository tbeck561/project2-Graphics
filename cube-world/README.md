# Minecraft at Home — Cube World

Tyler Beck · Intro to Computer Graphics · Project 2

A landscape made entirely of one 2×2×2 cube, drawn with plain WebGL (no libraries).

## Run it
Browsers won't let a page read image pixels when it's opened by double-clicking, so serve the folder:

    python3 -m http.server 8000

Then open http://localhost:8000.

## Host it (GitHub Pages)
Push this folder to a public GitHub repo, then go to Settings → Pages → Deploy from a branch → main → / (root).

## Files
- `index.html`: the page, header, level buttons and grid-size menu
- `style.css`: the page styling
- `math.js`: matrix math (translate, scale, rotate, perspective, lookAt)
- `cube.js`: the cube model
- `webgl.js`: the shaders and the helpers that send data to the GPU
- `landscape.js`: the grid of cubes, height procedure, vertex colors and image sampling
- `sky.js`: Bézier curves, clouds, the blimp and the birds
- `main.js`: level buttons, camera and the animation loop
- `assets/heightmap.png`, `assets/colormap.png`: the two input images

## Levels
| Level | What it shows |
|---|---|
| L0 | One 2×2×2 cube |
| L1a | Cubes translated into a grid on the x-z plane (grid sizes 10 to 150) |
| L1b | Cubes scaled in y (sine waves + random numbers) |
| L1c | Vertex colors: top vertices colored by height, bottom vertices brown |
| L1d | Camera orbiting (0, 0, 0) with lookAt |
| L2 | Heights from a grayscale height map, colors from a color map |
| L3 | Clouds, a blimp and birds made of cubes; the blimp and birds follow cubic Bézier curves |
| L4 | Sun lighting (Lambert) and distance fog |
