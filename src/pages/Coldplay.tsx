import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { InteractivePixelBackground } from '../components/ui/interactive-pixel-background';
import AnimatedShaderBackground from '../components/ui/animated-shader-background';
import { GrayscaleGradientBackground } from '../components/ui/paper-design-shader-background';
import MusicPlayer, { Track } from '../components/ui/music-player-widget';

// ── Album data ──────────────────────────────────────────────
interface Album {
  id: string;
  title: string;
  year: string;
  cover: string;
  tracks: string[];
  tiers?: Record<string, 1 | 2>;
}

function trackStyle(track: string, tiers?: Record<string, 1 | 2>) {
  const tier = tiers?.[track];
  if (tier === 1) return { color: 'rgba(255,255,255,0.90)', fontWeight: 700 };
  if (tier === 2) return { color: 'rgba(255,255,255,0.62)', fontWeight: 500 };
  return { color: 'rgba(255,255,255,0.40)', fontWeight: 400 };
}

const ALBUMS: Album[] = [
  {
    id: 'parachutes',
    title: 'Parachutes',
    year: '2000',
    cover: '/parachutes.png',
    tracks: [
      "Don't Panic", 'Shiver', 'Spies', 'Sparks', 'Yellow',
      'Trouble', 'Parachutes', 'High Speed', 'We Never Change', "Everything's Not Lost",
    ],
    tiers: {
      'Shiver': 1,
      'Yellow': 1,
      "Everything's Not Lost": 1,
      'Sparks': 2,
      'Trouble': 2,
      'High Speed': 2,
      "Don't Panic": 2
    },
  },
  {
    id: 'arobtth',
    title: 'A Rush of Blood to the Head',
    year: '2002',
    cover: '/AROBTTH.jpg',
    tracks: [
      'Politik', 'In My Place', 'God Put a Smile upon Your Face',
      'The Scientist', 'Clocks', 'Daylight', 'Green Eyes',
      'Warning Sign', 'A Whisper', 'A Rush of Blood to the Head', 'Amsterdam',
    ],
    tiers: {
      'In My Place': 1,
      'The Scientist': 1,
      'Green Eyes': 1,
      'Clocks': 2,
      'Warning Sign': 2,
      'A Rush of Blood to the Head': 2,
      'Amsterdam': 2,
    },
  },
  {
    id: 'viva',
    title: 'Viva la Vida',
    year: '2008',
    cover: '/PViva.png',
    tracks: [
      'Life in Technicolor', 'Cemeteries of London', 'Lost!', '42',
      'Lovers in Japan', 'Yes', 'Viva la Vida', 'Violet Hill',
      'Strawberry Swing', 'Death and All His Friends',
      'Life in Technicolor ii', 'Postcards from Far Away', 'Glass of Water',
      'Rainy Day', "Prospekt's March / Poppyfields", 'Lost+ (feat. Jay-Z)',
      "Now My Feet Won't Touch the Ground",
    ],
    tiers: {
      'Lovers in Japan': 1,
      'Viva la Vida': 1,
      'Life in Technicolor ii': 2,
      'Glass of Water': 2,
      'Strawberry Swing': 2,
      "Now My Feet Won't Touch the Ground": 2,
    },
  },
];

// ── iTunes 30-second preview tracks ────────────────────────
const PLAYER_TRACKS: Track[] = [
  {
    title: 'Yellow',
    artist: 'Coldplay',
    cover: '/parachutes.png',
    src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/66/f3/1a/66f31a76-a6ed-cb4c-f353-23310a7ae9a8/mzaf_10593596652344378873.plus.aac.p.m4a',
  },
  {
    title: 'Green Eyes',
    artist: 'Coldplay',
    cover: '/AROBTTH.jpg',
    src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8a/ec/6d/8aec6d06-b619-8ce4-2696-03f59254a139/mzaf_15939756984836122254.plus.aac.p.m4a',
  },
  {
    title: 'Glass of Water',
    artist: 'Coldplay',
    cover: '/PViva.png',
    src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/10/17/14/10171485-72c7-d616-f66f-d01691e2e6fc/mzaf_3887230690964978124.plus.aac.p.m4a',
  },
];

// ── Vinyl disk config (one per album, themed by featured song) ──
const DISK_CONFIGS: Record<string, {
  labelColor: string;
  labelHighlight: string;
  glowColor: string;
  trackIndex: number;
  songName: string;
}> = {
  parachutes: {
    labelColor: '#C49400',
    labelHighlight: '#FFE05C',
    glowColor: 'rgba(255,215,60,0.32)',
    trackIndex: 0,
    songName: 'Yellow',
  },
  arobtth: {
    labelColor: '#2E7D32',
    labelHighlight: '#60AD5E',
    glowColor: 'rgba(60,160,60,0.30)',
    trackIndex: 1,
    songName: 'Green Eyes',
  },
  viva: {
    labelColor: '#0097A7',
    labelHighlight: '#80DEEA',
    glowColor: 'rgba(0,188,212,0.28)',
    trackIndex: 2,
    songName: 'Glass of Water',
  },
};

// ── Vinyl disk SVG ──────────────────────────────────────────
// Label is shifted to cy=65 (lower third) so when the disk peeks from below
// an album cover, the colored label is the part that's actually visible.
const VinylDisk: React.FC<{
  albumId: string;
  labelColor: string;
  labelHighlight: string;
  glowColor: string;
  songName: string;
  onClick?: () => void;
}> = ({ albumId, labelColor, labelHighlight, glowColor, songName, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const gradId = `vl-${albumId}`;
  const vinylId = `vv-${albumId}`;
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        filter: hovered
          ? `drop-shadow(0 4px 20px ${glowColor}) drop-shadow(0 0 10px ${glowColor})`
          : `drop-shadow(0 3px 12px ${glowColor})`,
        transform: hovered ? 'scale(1.07)' : 'scale(1)',
        transition: 'filter 0.3s ease, transform 0.3s ease',
      }}
    >
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <radialGradient id={gradId} cx="38%" cy="30%" r="68%">
            <stop offset="0%" stopColor={labelHighlight} />
            <stop offset="100%" stopColor={labelColor} />
          </radialGradient>
          <radialGradient id={vinylId} cx="36%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#2e2e2e" />
            <stop offset="100%" stopColor="#070707" />
          </radialGradient>
        </defs>
        {/* Vinyl body */}
        <circle cx="50" cy="50" r="50" fill={`url(#${vinylId})`} />
        {/* Groove rings (centered on disk) */}
        {[46, 42, 38, 34, 30].map((r) => (
          <circle key={r} cx="50" cy="50" r={r} fill="none"
            stroke="rgba(255,255,255,0.03)" strokeWidth="0.65" />
        ))}
        {/* Label circle shifted to lower third so it peeks out below the album */}
        <circle cx="50" cy="65" r="22" fill={`url(#${gradId})`} />
        <circle cx="50" cy="65" r="22" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
        <circle cx="50" cy="65" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
        {/* Song name on label */}
        <text x="50" y="67" textAnchor="middle" dominantBaseline="middle"
          fontFamily="Georgia, serif" fontStyle="italic" fontSize="6.5"
          fill="rgba(0,0,0,0.5)" letterSpacing="0.2">
          {songName}
        </text>
        {/* Center hole */}
        <circle cx="50" cy="65" r="3" fill="#05050c" />
        {/* Gloss highlight on upper vinyl */}
        <ellipse cx="34" cy="24" rx="10" ry="6" fill="rgba(255,255,255,0.05)"
          transform="rotate(-18 34 24)" />
      </svg>
    </div>
  );
};

// ── Museum placard ──────────────────────────────────────────
const Placard: React.FC<{ album: Album; visible: boolean }> = ({ album, visible }) => (
  <motion.div
    animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 14 }}
    transition={{ duration: 0.45, ease: 'easeOut' }}
    className="ml-10 flex-shrink-0 flex flex-col justify-center pointer-events-none select-none"
    style={{ width: '220px', position: 'relative' }}
  >
    <div
      style={{
        position: 'absolute',
        left: '-22px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '1px',
        height: '44px',
        background:
          'linear-gradient(to bottom, transparent, rgba(210, 110, 30, 0.65), transparent)',
      }}
    />
    <div className="w-8 h-px mb-5" style={{ background: 'rgba(255,255,255,0.22)' }} />
    <h2
      style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        fontSize: '1.35rem',
        color: 'rgba(255,255,255,0.90)',
        lineHeight: 1.25,
        marginBottom: '0.5rem',
        letterSpacing: '0.01em',
      }}
    >
      {album.title}
    </h2>
    <p
      style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: '9px',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.30)',
        marginBottom: '1.25rem',
      }}
    >
      {album.year}
    </p>
    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {album.tracks.map((track, i) => {
        const ts = trackStyle(track, album.tiers);
        return (
          <li
            key={track}
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.07em',
              color: ts.color,
              fontWeight: ts.fontWeight,
              lineHeight: '1.9',
              display: 'flex',
              gap: '10px',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.16)', minWidth: '18px' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {track}
          </li>
        );
      })}
    </ol>
  </motion.div>
);

// ── Single album exhibit ────────────────────────────────────
const Exhibit: React.FC<{
  album: Album;
  showHint?: boolean;
  onDiskClick: (index: number) => void;
}> = ({ album, showHint = false, onDiskClick }) => {
  const [hovered, setHovered] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);
  const diskCfg = DISK_CONFIGS[album.id];

  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: '100vw', height: '100%' }}
    >
      <div
        className="flex items-center"
        onMouseEnter={() => { setHovered(true); setHasHovered(true); }}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'default' }}
      >
        <div style={{ position: 'relative', height: '40vh', flexShrink: 0 }}>
          <motion.div
            animate={{ scale: hovered ? 0.95 : 1, y: hovered ? -4 : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ height: '100%', position: 'relative', zIndex: 2 }}
          >
            <img
              src={album.cover}
              alt={album.title}
              draggable={false}
              style={{ height: '100%', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </motion.div>

          {diskCfg && (
            <div style={{
              position: 'absolute',
              bottom: '-8vh',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '15vh',
              height: '15vh',
              zIndex: 1,
            }}>
              <VinylDisk
                albumId={album.id}
                labelColor={diskCfg.labelColor}
                labelHighlight={diskCfg.labelHighlight}
                glowColor={diskCfg.glowColor}
                songName={diskCfg.songName}
                onClick={() => onDiskClick(diskCfg.trackIndex)}
              />
            </div>
          )}

          <AnimatePresence>
            {showHint && !hasHovered && (
              <motion.p
                key="hover-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.4, duration: 0.7 }}
                style={{
                  position: 'absolute',
                  top: '-26px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '11px',
                  letterSpacing: '0.45em',
                  textTransform: 'uppercase',
                  color: 'white',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                hover me!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <Placard album={album} visible={hovered} />
      </div>
    </div>
  );
};

// ── Mobile: vertical stack, placards always visible ─────────
const MobileGallery: React.FC<{ onDiskClick: (index: number) => void }> = ({ onDiskClick }) => (
  <div
    className="flex flex-col items-center gap-20 py-24 px-8"
    style={{ background: '#05050a', minHeight: '100vh' }}
  >
    {ALBUMS.map((album) => {
      const diskCfg = DISK_CONFIGS[album.id];
      return (
      <div key={album.id} className="flex flex-col items-center w-full max-w-xs">
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '3rem' }}>
          <img
            src={album.cover}
            alt={album.title}
            draggable={false}
            style={{ height: '38vh', width: 'auto', objectFit: 'contain', display: 'block', position: 'relative', zIndex: 2 }}
          />
          {diskCfg && (
            <div style={{
              position: 'absolute', bottom: '-8vh', left: '50%',
              transform: 'translateX(-50%)', width: '15vh', height: '15vh', zIndex: 1,
            }}>
              <VinylDisk
                albumId={album.id}
                labelColor={diskCfg.labelColor}
                labelHighlight={diskCfg.labelHighlight}
                glowColor={diskCfg.glowColor}
                songName={diskCfg.songName}
                onClick={() => onDiskClick(diskCfg.trackIndex)}
              />
            </div>
          )}
        </div>
        <div className="w-8 h-px mb-4" style={{ background: 'rgba(255,255,255,0.22)' }} />
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: '1.35rem',
            color: 'rgba(255,255,255,0.90)',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          {album.title}
        </h2>
        <p
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.30)',
            marginBottom: '1.25rem',
          }}
        >
          {album.year}
        </p>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
          {album.tracks.map((track, i) => {
            const ts = trackStyle(track, album.tiers);
            return (
              <li
                key={track}
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '11px',
                  letterSpacing: '0.07em',
                  color: ts.color,
                  fontWeight: ts.fontWeight,
                  lineHeight: '1.9',
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.16)', minWidth: '18px' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {track}
              </li>
            );
          })}
        </ol>
      </div>
      );
    })}
  </div>
);

// ── Main component ──────────────────────────────────────────
// Layout: 400vh outer div → sticky 100vh viewport → 280vw horizontal track
// Pan: x goes 0vw → -180vw as scrollYProgress goes 0 → 1
// Track: [100vw Parachutes] [80vw gap] [100vw Viva la Vida] = 280vw total
const Coldplay: React.FC = () => {
  const { scrollYProgress } = useScroll();

  const x = useTransform(scrollYProgress, [0.1, 1], ['0vw', '-360vw']);
  const overlayOpacity  = useTransform(scrollYProgress, [0, 0.25, 0.35, 1], [1, 1, 0, 0]);
  const arobtthOpacity  = useTransform(scrollYProgress, [0.25, 0.35, 0.65, 0.75], [0, 1, 1, 0]);
  const pixelBgOpacity  = useTransform(scrollYProgress, [0, 0.65, 0.75, 1], [0, 0, 1, 1]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  const [auroraPaused, setAuroraPaused] = useState(false);
  const [arobtthPaused, setArobtthPaused] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState(0);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number | null>(null);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setAuroraPaused(v > 0.35);
    setArobtthPaused(v < 0.25 || v > 0.75);
    setActiveAlbum(v < 0.33 ? 0 : v < 0.67 ? 1 : 2);
  });

  // ── UPDATE MONTHLY ────────────────────────────────────────
  const songOfMonth = { title: 'JUPiTER', album: 'Moon Music', year: '2024' };
  // ──────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Song of the Month ── */}
      <div style={{ background: '#05050a', padding: '4rem 2rem 3.5rem' }}>
        <div style={{ maxWidth: '360px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            marginBottom: '1.1rem',
          }}>
            My Coldplay Song of the Month
          </p>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.55rem',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.88)',
            letterSpacing: '0.01em',
            marginBottom: '0.5rem',
          }}>
            {songOfMonth.title}
          </p>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
          }}>
            {songOfMonth.album} — {songOfMonth.year}
          </p>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="md:hidden">
        <MobileGallery onDiskClick={setActiveTrackIndex} />
      </div>

      {/* ── Desktop horizontal gallery ── */}
      <div className="hidden md:block" style={{ height: '600vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden" style={{ background: '#05050a' }}>

          {/* Interactive pixel background — fades in as scroll enters Viva la Vida */}
          <motion.div className="absolute inset-0" style={{ zIndex: 0, opacity: pixelBgOpacity }}>
            <InteractivePixelBackground
              imageSrc="/PVivaP.png"
              brightnessThreshold={80}
              sampleRate={4}
              background="#000000"
              springStrength={0.04}
              friction={0.84}
            />
          </motion.div>

          {/* Parachutes shader — fades out as scroll enters AROBTTH */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: overlayOpacity, zIndex: 1 }}
          >
            <AnimatedShaderBackground paused={auroraPaused} />
          </motion.div>

          {/* AROBTTH grayscale shader — fades in/out around the middle album */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: arobtthOpacity, zIndex: 1 }}
          >
            <GrayscaleGradientBackground paused={arobtthPaused} />
          </motion.div>

          {/* Grain texture */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.04, zIndex: 2 }}
            aria-hidden="true"
          >
            <filter id="gallery-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#gallery-grain)" />
          </svg>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.72) 100%)',
              zIndex: 3,
            }}
          />

          {/* Horizontal track */}
          <motion.div
            style={{
              x,
              display: 'flex',
              width: '460vw',
              height: '100%',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <Exhibit album={ALBUMS[0]} showHint onDiskClick={setActiveTrackIndex} />
            <div style={{ width: '80vw', flexShrink: 0 }} />
            <Exhibit album={ALBUMS[1]} onDiskClick={setActiveTrackIndex} />
            <div style={{ width: '80vw', flexShrink: 0 }} />
            <Exhibit album={ALBUMS[2]} onDiskClick={setActiveTrackIndex} />
          </motion.div>

          {/* Gallery label top-left */}
          <div className="absolute top-8 left-8 pointer-events-none" style={{ zIndex: 20 }}>
            <p
              className="font-beezee"
              style={{
                fontSize: '10px',
                letterSpacing: '0.55em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.40)',
              }}
            >
              Coldplay
            </p>
            <p
              className="font-beezee"
              style={{
                fontSize: '8px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.18)',
                marginTop: '4px',
              }}
            >
              My Favorites
            </p>
          </div>

          {/* Album indicator dots */}
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 pointer-events-none"
            style={{ zIndex: 20 }}
          >
            {ALBUMS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: activeAlbum === i ? 0.85 : 0.25,
                  scale: activeAlbum === i ? 1.4 : 1,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }}
              />
            ))}
          </div>

          {/* Scroll progress line */}
          <motion.div
            className="absolute bottom-0 left-0 h-px w-full"
            style={{
              scaleX: scrollYProgress,
              transformOrigin: 'left',
              background: 'rgba(255,255,255,0.14)',
              zIndex: 20,
            }}
          />

          {/* Scroll hint — fades out on first scroll */}
          <motion.div
            style={{ opacity: hintOpacity, zIndex: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-3"
          >
            <motion.div
              className="w-px h-8"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.24), transparent)',
                originY: 0,
              }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

        </div>
      </div>

      {/* ── Music player widget ── */}
      <AnimatePresence>
        {activeTrackIndex !== null && (
          <motion.div
            key="music-player"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: '28px',
              left: '50%',
              x: '-50%',
              zIndex: 60,
            }}
          >
            <MusicPlayer
              tracks={PLAYER_TRACKS}
              controlledIndex={activeTrackIndex}
              onClose={() => setActiveTrackIndex(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Coldplay;
