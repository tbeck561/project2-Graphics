// webgl setup with the shaders and the helpers that send data to the gpu

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// the vertex shader runs once for every vertex
// it moves each vertex from model space to world space to camera space to the screen
const vertexShader = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  attribute vec3 aNormal;
  uniform mat4 uModel, uView, uProjection;
  varying vec3 vColor, vNormal, vWorld;
  void main() {
    vec4 world = uModel * vec4(aPosition, 1.0);
    // the color gets blended across each triangle
    vColor = aColor;
    // the normal is rotated but not moved
    vNormal = (uModel * vec4(aNormal, 0.0)).xyz;
    vWorld = world.xyz;
    gl_Position = uProjection * uView * world;
  }`;

// the fragment shader runs once for every pixel and picks its color
const fragmentShader = `
  precision mediump float;
  varying vec3 vColor, vNormal, vWorld;
  // tint multiplies the vertex color so the white sky cubes can be any color
  uniform vec3 uTint;
  // lighting is only on in level four
  uniform bool uLighting;
  uniform vec3 uCamera, uSky;
  void main() {
    vec3 n = normalize(vNormal);
    float shade;
    if (uLighting) {
      // ambient light plus lambert diffuse light from the sun
      vec3 sun = normalize(vec3(0.5, 0.8, 0.3));
      shade = 0.35 + 0.75 * max(dot(n, sun), 0.0);
    } else {
      // simple fixed shading so each side of a cube looks a little different
      shade = 0.8 + 0.2 * n.y - 0.1 * abs(n.x);
    }
    vec3 color = vColor * uTint * shade;
    if (uLighting) {
      // distance fog fades far pixels into the sky color
      float fog = smoothstep(30.0, 95.0, length(vWorld - uCamera));
      color = mix(color, uSky, fog);
    }
    gl_FragColor = vec4(color, 1.0);
  }`;

// compile one shader and stop with an error message if it fails
function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

// link both shaders into one program
const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader));
gl.linkProgram(program);
gl.useProgram(program);

// look up where each attribute and uniform lives in the program
const loc = {};
for (const name of ['aPosition', 'aColor', 'aNormal']) loc[name] = gl.getAttribLocation(program, name);
for (const name of ['uModel', 'uView', 'uProjection', 'uTint', 'uLighting', 'uCamera', 'uSky']) loc[name] = gl.getUniformLocation(program, name);

// a mesh is three gpu buffers for positions colors and normals
function makeMesh(positions, colors, normals) {
  const buffer = (data) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return b;
  };
  return { pos: buffer(positions), color: buffer(colors), normal: buffer(normals), count: positions.length / 3 };
}

// draw a mesh with a model matrix and a tint color
function drawMesh(mesh, model, tint) {
  for (const [name, buf] of [['aPosition', mesh.pos], ['aColor', mesh.color], ['aNormal', mesh.normal]]) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc[name]);
    gl.vertexAttribPointer(loc[name], 3, gl.FLOAT, false, 0, 0);
  }
  gl.uniformMatrix4fv(loc.uModel, false, model);
  gl.uniform3fv(loc.uTint, tint);
  gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
}

// one white cube used for every sky object
const unitCube = makeMesh(
  CUBE.flatMap((v) => v.pos), CUBE.flatMap(() => [1, 1, 1]), CUBE.flatMap((v) => v.normal));

// the green and brown cube shown in level zero
const singleCube = makeMesh(
  CUBE.flatMap((v) => v.pos),
  CUBE.flatMap((v) => (v.pos[1] > 0 ? [0.3, 0.65, 0.25] : [0.35, 0.22, 0.1])),
  CUBE.flatMap((v) => v.normal));
