import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { ComicText } from '../components/ui/comic-text';
import { InteractivePixelBackground } from '../components/ui/interactive-pixel-background';
import { Sword, Flame, Crown } from 'lucide-react';

const TOTAL_FRAMES = 240;
const READY_AT     = 0.25;

const frameUrl = (n: number) =>
  `/Parachutes/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;

const Coldplay: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imagesRef    = useRef<HTMLImageElement[]>([]);
  const currentFrame = useRef(0);

  const [loadedCount, setLoadedCount] = useState(0);
  const isReady = loadedCount >= TOTAL_FRAMES * READY_AT;
  const loadPct = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { scrollY } = useScroll();

  // Section-relative progress derived from raw pixel scroll + element offsetTop
  const scrollYProgress = useTransform(scrollY, (y) => {
    const el = containerRef.current;
    if (!el) return 0;
    return Math.max(0, Math.min(1, (y - el.offsetTop) / (el.offsetHeight - window.innerHeight)));
  });

  // ── Draw frame ─────────────────────────────────────────────
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[index];
    if (!canvas || !img?.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: cw, height: ch } = canvas;
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cw / ch;
    let dw: number, dh: number, dx: number, dy: number;
    if (ir > cr) { dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0; }
    else          { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // ── Preload all frames ──────────────────────────────────────
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = frameUrl(i);
      img.onload = () => {
        setLoadedCount(c => c + 1);
        if (i === 1) drawFrame(0);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, [drawFrame]);

  // ── Resize canvas ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrame.current);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawFrame]);

  // ── Scrub on scroll ─────────────────────────────────────────
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!isReady || prefersReduced) return;
    const idx = Math.min(Math.floor(latest * TOTAL_FRAMES), TOTAL_FRAMES - 1);
    if (idx !== currentFrame.current) {
      currentFrame.current = idx;
      drawFrame(idx);
    }
  });

  // ── Text transforms (all hooks at top level) ───────────────
  const yellowOpacity = useTransform(scrollYProgress, [0.10, 0.20, 0.32, 0.41], [0, 1, 1, 0]);
  const yellowY       = useTransform(scrollYProgress, [0.10, 0.22], ['36px', '0px']);
  const yellowScale   = useTransform(scrollYProgress, [0.10, 0.22], [0.94, 1]);
  const yellowFilter  = useTransform(scrollYProgress, [0.10, 0.22], ['blur(8px)', 'blur(0px)']);

  const evOpacity     = useTransform(scrollYProgress, [0.43, 0.52, 0.63, 0.71], [0, 1, 1, 0]);
  const evY           = useTransform(scrollYProgress, [0.43, 0.53], ['36px', '0px']);
  const evScale       = useTransform(scrollYProgress, [0.43, 0.53], [0.94, 1]);
  const evFilter      = useTransform(scrollYProgress, [0.43, 0.53], ['blur(8px)', 'blur(0px)']);

  const shiverOpacity = useTransform(scrollYProgress, [0.73, 0.82, 0.91, 0.98], [0, 1, 1, 0]);
  const shiverY       = useTransform(scrollYProgress, [0.73, 0.83], ['36px', '0px']);
  const shiverScale   = useTransform(scrollYProgress, [0.73, 0.83], [0.94, 1]);
  const shiverFilter  = useTransform(scrollYProgress, [0.73, 0.83], ['blur(8px)', 'blur(0px)']);

  const hintOpacity   = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // ── Viva la Vida section scroll ────────────────────────────
  const vivaRef = useRef<HTMLDivElement>(null);
  const vivaProg = useTransform(scrollY, (y) => {
    const el = vivaRef.current;
    if (!el) return 0;
    return Math.max(0, Math.min(1, (y - el.offsetTop) / (el.offsetHeight - window.innerHeight)));
  });

  const badgeOpacity   = useTransform(vivaProg, [0.02, 0.10], [0, 1]);
  const badgeY         = useTransform(vivaProg, [0.02, 0.10], ['20px', '0px']);

  // 5 song title popups spread across 0→0.95 so all reliably appear
  const s0Opacity = useTransform(vivaProg, [0.04, 0.11, 0.17, 0.22], [0, 1, 1, 0]);
  const s0Y       = useTransform(vivaProg, [0.04, 0.12], ['36px', '0px']);
  const s0Filter  = useTransform(vivaProg, [0.04, 0.12], ['blur(10px)', 'blur(0px)']);

  const s1Opacity = useTransform(vivaProg, [0.22, 0.29, 0.35, 0.40], [0, 1, 1, 0]);
  const s1Y       = useTransform(vivaProg, [0.22, 0.30], ['36px', '0px']);
  const s1Filter  = useTransform(vivaProg, [0.22, 0.30], ['blur(10px)', 'blur(0px)']);

  const s2Opacity = useTransform(vivaProg, [0.40, 0.47, 0.53, 0.58], [0, 1, 1, 0]);
  const s2Y       = useTransform(vivaProg, [0.40, 0.48], ['36px', '0px']);
  const s2Filter  = useTransform(vivaProg, [0.40, 0.48], ['blur(10px)', 'blur(0px)']);

  const s3Opacity = useTransform(vivaProg, [0.58, 0.65, 0.71, 0.76], [0, 1, 1, 0]);
  const s3Y       = useTransform(vivaProg, [0.58, 0.66], ['36px', '0px']);
  const s3Filter  = useTransform(vivaProg, [0.58, 0.66], ['blur(10px)', 'blur(0px)']);

  const s4Opacity = useTransform(vivaProg, [0.76, 0.83, 0.89, 0.94], [0, 1, 1, 0]);
  const s4Y       = useTransform(vivaProg, [0.76, 0.84], ['36px', '0px']);
  const s4Filter  = useTransform(vivaProg, [0.76, 0.84], ['blur(10px)', 'blur(0px)']);

  const vivaFadeIn     = useTransform(vivaProg, [0, 0.05], [1, 0]);
  const iconsOpacity   = useTransform(vivaProg, [0.88, 0.94], [0, 1]);
  const vivaHint       = useTransform(vivaProg, [0, 0.05], [1, 0]);

  return (
    <>
    <div ref={containerRef} style={{ height: prefersReduced ? '100vh' : '500vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0a0a12]">

        {/* Grain overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04] z-10" aria-hidden="true">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Frame canvas */}
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Radial + linear vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.8) 100%)' }}
        />
        <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-b from-black/50 via-transparent to-black/65" />

        {/* ── Loading overlay ── */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a12] z-30"
          animate={{ opacity: isReady ? 0 : 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ pointerEvents: isReady ? 'none' : 'auto' }}
        >
          <p className="text-white/20 tracking-[0.6em] text-[10px] uppercase font-beezee mb-8">
            Coldplay — Parachutes
          </p>
          <div className="w-40 h-px bg-white/10 relative overflow-hidden rounded-full">
            <div
              className="absolute inset-y-0 left-0 bg-white/50 rounded-full transition-all duration-150"
              style={{ width: `${loadPct}%` }}
            />
          </div>
          <p className="text-white/15 text-[10px] tracking-[0.3em] font-beezee mt-4">{loadPct}%</p>
        </motion.div>

        {/* ── Album label ── */}
        <div className="absolute top-8 left-8 z-20 pointer-events-none">
          <p className="text-white/50 text-[11px] tracking-[0.55em] uppercase font-beezee">Coldplay</p>
          <p className="text-white/20 text-[9px] tracking-[0.4em] uppercase font-beezee mt-1">Parachutes &mdash; 2000</p>
        </div>

        {/* ── Yellow ── */}
        <motion.div
          style={{ opacity: yellowOpacity, y: yellowY, scale: yellowScale, filter: yellowFilter }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        >
          <ComicText fontSize={7} dotColor="#FBBF24" backgroundColor="#FDE68A" disableAnimation>
            Yellow
          </ComicText>
        </motion.div>

        {/* ── Everything's Not Lost ── */}
        <motion.div
          style={{ opacity: evOpacity, y: evY, scale: evScale, filter: evFilter }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none px-8 z-20"
        >
          <ComicText fontSize={4} dotColor="#A855F7" backgroundColor="#E9D5FF" disableAnimation>
            Everything's Not Lost
          </ComicText>
        </motion.div>

        {/* ── Shiver ── */}
        <motion.div
          style={{ opacity: shiverOpacity, y: shiverY, scale: shiverScale, filter: shiverFilter }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        >
          <ComicText fontSize={7} dotColor="#14B8A6" backgroundColor="#99F6E4" disableAnimation>
            Shiver
          </ComicText>
        </motion.div>

        {/* ── Scroll progress line ── */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-white/20 z-20"
          style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
        />

        {/* ── Scroll hint ── */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-20"
        >
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
            animate={{ scaleY: [0, 1, 0] }}
            style={{ originY: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

      </div>
    </div>

    {/* ══ VIVA LA VIDA — scroll-driven shader section ══════════ */}
    <div ref={vivaRef} style={{ height: '600vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Interactive particle image */}
        <InteractivePixelBackground 
          imageSrc="/PVivaP.png" 
          brightnessThreshold={80} 
          sampleRate={4} 
          background="#000000" 
          springStrength={0.04} 
          friction={0.84} 
        />

        {/* SVG oil-paint canvas texture overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
          style={{ mixBlendMode: 'overlay', opacity: 0.18 }}
          aria-hidden="true"
        >
          <filter id="oilpaint">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="5" seed="7" />
            <feColorMatrix type="saturate" values="0.4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#oilpaint)" />
        </svg>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)' }}
        />

        {/* ── Crossfade in from Parachutes black ── */}
        <motion.div
          className="absolute inset-0 bg-[#0a0a12] pointer-events-none z-[4]"
          style={{ opacity: vivaFadeIn }}
        />

        {/* ── Album label ── */}
        <div className="absolute top-8 left-8 z-20 pointer-events-none">
          <p className="text-white/50 text-[11px] tracking-[0.55em] uppercase font-beezee">Coldplay</p>
          <p className="text-white/20 text-[9px] tracking-[0.4em] uppercase font-beezee mt-1">Viva la Vida &mdash; 2008</p>
        </div>

        {/* ── Song titles ── */}
        {([
          { opacity: s0Opacity, y: s0Y, filter: s0Filter, label: 'Lovers in Japan' },
          { opacity: s1Opacity, y: s1Y, filter: s1Filter, label: 'Viva La Vida' },
          { opacity: s2Opacity, y: s2Y, filter: s2Filter, label: 'Strawberry Swing' },
          { opacity: s3Opacity, y: s3Y, filter: s3Filter, label: 'Life in Technicolor II' },
          { opacity: s4Opacity, y: s4Y, filter: s4Filter, label: 'Glass of Water' },
        ]).map(({ opacity, y, filter, label }) => (
          <motion.div
            key={label}
            style={{ opacity, y, filter }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-8"
          >
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: 'clamp(2.8rem, 8vw, 7rem)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: '#d9ccb9',
              textShadow: '0 0 100px rgba(115,5,5,0.8), 3px 3px 0 rgba(5,26,64,0.7)',
              lineHeight: 1.1,
            }}>
              {label}
            </span>
          </motion.div>
        ))}

        {/* ── Icons — Flame · Crown · Flame ── */}


        {/* ── Scroll hint ── */}
        <motion.div
          style={{ opacity: vivaHint }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-20"
        >

          <motion.div
            className="w-px h-8"
            style={{ background: 'linear-gradient(to bottom, rgba(217,204,185,0.3), transparent)', originY: 0 }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

      </div>
    </div>
    </>
  );
};

export default Coldplay;
