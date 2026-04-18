import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  homeX: number; homeY: number;
  vx: number; vy: number;
  r: number; g: number; b: number;
  size: number;
}

interface Props {
  imageSrc: string;
  brightnessThreshold?: number; // 0-255, keep pixels brighter than this
  sampleRate?: number;          // sample every N pixels
  fleeRadius?: number;          // CSS px
  fleeStrength?: number;
  springStrength?: number;
  friction?: number;
  background?: string;
}

export function InteractivePixelBackground({
  imageSrc,
  brightnessThreshold = 80,
  sampleRate = 5,
  fleeRadius = 130,
  fleeStrength = 10,
  springStrength = 0.07,
  friction = 0.87,
  background = '#051a40',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>();
  const particles = useRef<Particle[]>([]);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const dpr       = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    dpr.current = Math.min(window.devicePixelRatio ?? 1, 2);

    const ctx = canvas.getContext('2d')!;
    let alive = true;

    // ── Build particle list from sampled image data ──────────
    const buildParticles = () => {
      const W = canvas.width;
      const H = canvas.height;
      const d = dpr.current;

      const off = document.createElement('canvas');
      off.width  = W;
      off.height = H;
      const octx = off.getContext('2d')!;

      // Contain-fit the image so the full image is always visible
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = W / H;
      let dw: number, dh: number, dx: number, dy: number;
      if (ir > cr) { dw = W; dh = W / ir; dx = 0; dy = (H - dh) / 2; }
      else          { dh = H; dw = H * ir; dx = (W - dw) / 2; dy = 0; }
      octx.drawImage(img, dx, dy, dw, dh);

      const { data } = octx.getImageData(0, 0, W, H);
      const step = Math.round(sampleRate * d); // scale sample rate by DPR
      const out: Particle[] = [];

      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const i = (y * W + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < brightnessThreshold) continue;

          out.push({
            x: x, y: y,
            homeX: x, homeY: y,
            vx: 0, vy: 0,
            r, g, b,
            size: (Math.random() * 1.2 + 0.6) * d,
          });
        }
      }

      particles.current = out;
    };

    // ── Resize handler ───────────────────────────────────────
    const resize = () => {
      const d = dpr.current;
      canvas.width  = canvas.offsetWidth  * d;
      canvas.height = canvas.offsetHeight * d;
      if (img.complete && img.naturalWidth) buildParticles();
    };

    // ── Mouse tracking (window-level so overlays don't block) ─
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const d    = dpr.current;
      mouse.current = {
        x: (e.clientX - rect.left)  * d,
        y: (e.clientY - rect.top) * d,
      };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    // ── Animation loop ───────────────────────────────────────
    const loop = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx  = mouse.current.x;
      const my  = mouse.current.y;
      const d   = dpr.current;
      const fr2 = (fleeRadius * d) ** 2;
      const fr  = fleeRadius * d;

      for (const p of particles.current) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;

        if (d2 < fr2 && d2 > 0) {
          const dist  = Math.sqrt(d2);
          const force = ((fr - dist) / fr) * fleeStrength;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Spring toward home
        p.vx += (p.homeX - p.x) * springStrength;
        p.vy += (p.homeY - p.y) * springStrength;

        // Friction
        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    // ── Load image ───────────────────────────────────────────
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      resize();
      loop();
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    return () => {
      alive = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [imageSrc, brightnessThreshold, sampleRate, fleeRadius, fleeStrength, springStrength, friction]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background }}
    />
  );
}
