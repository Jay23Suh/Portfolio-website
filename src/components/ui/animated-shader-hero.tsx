import React, { useRef, useEffect } from 'react';

// ── GLSL: Viva la Vida — painterly oil-smoke shader ────────
const SHADER_SRC = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
uniform vec2 touch;
uniform int pointerCount;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x, R.y)

float rnd(vec2 p) {
  p = fract(p * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f*f*(3.-2.*f);
  return mix(mix(rnd(i), rnd(i+vec2(1,0)), u.x),
             mix(rnd(i+vec2(0,1)), rnd(i+1.), u.x), u.y);
}

float fbm(vec2 p) {
  float t = 0., a = .5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 7; i++) { t += a*noise(p); p = m*p; a *= .5; }
  return t;
}

// Domain-warped smoke — gives painterly, oil-stroke streaks
float smoke(vec2 p, float spd) {
  vec2 q = vec2(fbm(p + vec2(0., spd*T*0.06)), fbm(p + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(p + 4.*q + vec2(1.7, 9.2) + 0.15*spd*T),
                fbm(p + 4.*q + vec2(8.3, 2.8) + 0.126*spd*T));
  return fbm(p + 4.*r);
}

// Splatter: sparse hard paint-drop dots
float splatter(vec2 p, float scale) {
  vec2 grid = floor(p * scale);
  vec2 local = fract(p * scale) - 0.5;
  float n    = rnd(grid + vec2(13.7, 5.3));
  float size = mix(0.02, 0.16, rnd(grid));
  return step(length(local), size) * step(0.80, n);
}

void main() {
  vec2 uv = FC / R;
  vec2 p  = (FC - 0.5*R) / MN;

  // Palette — Deep Revolutionary Red / French Blue / aged Parchment
  vec3 red   = vec3(0.451, 0.020, 0.020);   // #730505
  vec3 blue  = vec3(0.020, 0.102, 0.251);   // #051a40
  vec3 parch = vec3(0.851, 0.800, 0.725);   // #d9ccb9

  // Three smoke layers at different speeds/scales
  float s1 = smoke(p * 1.6 + vec2(0.1, 0.2), 1.0);
  float s2 = smoke(p * 2.2 + vec2(3.1, 0.5), 0.65);
  float s3 = smoke(p * 0.8 + vec2(1.5, 2.5), 1.4);

  // Painterly colour blend
  vec3 col = mix(blue, red, smoothstep(0.3, 0.7, s1));
  col = mix(col, parch * 0.85, s2 * s3 * 0.42);
  col = mix(col, red,          s3 * (1.-s1) * 0.5);

  // Stormy sky: darken toward top
  col = mix(col, blue * 0.2, (1. - uv.y) * 0.6);

  // Brush-stroke grain overlay
  float stroke = (noise(p * 22. + T * 0.04) - 0.5) * 0.07;
  col += stroke * parch * 0.6;

  // Crackle — aged oil paint surface
  float crack = abs(noise(p * 30.) - 0.5) * 0.055;
  col -= crack;

  // Splatter / grit in 3 scales
  float g  = splatter(p + vec2(T*0.008, 0.),           6.);
       g  += splatter(p + vec2(0., T*0.005),            11.);
       g  += splatter(p * 1.4 + vec2(0.3*sin(T*0.05), 0.), 18.);
  g = clamp(g, 0., 1.);
  col = mix(col, blue * 0.08, g * 0.55);   // dark paint drops
  col = mix(col, parch * 1.4, g * 0.55);  // bright light specks

  // Radial vignette — frame like an old canvas
  float v = 1. - dot(uv - 0.5, uv - 0.5) * 2.4;
  col *= clamp(v, 0.05, 1.);

  O = vec4(clamp(col, 0., 1.), 1.);
}`;

// ── WebGL helpers ───────────────────────────────────────────
function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
  }
  return s;
}

const VERT_SRC = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`;

const VERTS = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);

// ── ShaderBackground component ──────────────────────────────
export const ShaderBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    // Build program
    const vs  = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs  = compileShader(gl, gl.FRAGMENT_SHADER, SHADER_SRC);
    const prg = gl.createProgram()!;
    gl.attachShader(prg, vs); gl.attachShader(prg, fs);
    gl.linkProgram(prg);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, VERTS, gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prg, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prg, 'resolution');
    const uTime = gl.getUniformLocation(prg, 'time');
    const uTouch = gl.getUniformLocation(prg, 'touch');
    const uPtrCount = gl.getUniformLocation(prg, 'pointerCount');

    let raf: number;
    let touch = [0, 0];

    const onPointer = (e: PointerEvent) => { touch = [e.clientX, e.clientY]; };
    canvas.addEventListener('pointermove', onPointer);

    const resize = () => {
      const dpr = Math.max(1, 0.5 * devicePixelRatio);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      gl.useProgram(prg);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 1e-3);
      gl.uniform2f(uTouch, touch[0], touch[1]);
      gl.uniform1i(uPtrCount, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onPointer);
      gl.deleteProgram(prg);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full touch-none"
      style={{ background: '#051a40' }}
    />
  );
};
