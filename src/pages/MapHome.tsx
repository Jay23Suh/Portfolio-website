import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

// ── Canvas constants ─────────────────────────────────────────────────

const CANVAS_W = 1540;
const CANVAS_H = 1640;
const CARD_W   = 255;
const CARD_H   = 230;

// ── Project card data ─────────────────────────────────────────────────

interface CardData {
  id: string;
  to?: string;
  href?: string;
  img: string;
  imgFit?: 'cover' | 'contain';
  title: string;
  desc: string;
  accent: string;
  tag: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

const CARDS: CardData[] = [
  // ── Row 1: HCD chronological sequence (left → right) ─────────────
  {
    id: 'saver', to: '/ProjectSaverSports',
    img: '/SaverLogo.jpeg', imgFit: 'contain',
    title: 'Saver Sports', desc: 'Empowers young athletes through community support.',
    accent: '#84cc16', tag: 'Youth', x: 75, y: 212,
  },
  {
    id: 'sparkathon', to: '/Sparkathon',
    img: '/Sparkathon.png', imgFit: 'cover',
    title: 'Sparkathon', desc: 'HCD pitch competition by Pomona Ventures.',
    accent: '#0ea5e9', tag: 'Event', x: 360, y: 180,
  },
  {
    id: 'crosscamp', to: '/project-two',
    img: '/Tccs.png', imgFit: 'contain',
    title: 'Cross-campus Staff', desc: 'Staff collaboration fosters a stronger community.',
    accent: '#6366f1', tag: 'Community', x: 645, y: 222,
  },
  {
    id: 'intergen', to: '/project-one',
    img: '/banner.png', imgFit: 'cover',
    title: 'Intergenerational Connectivity', desc: 'Connections that create meaningful relationships.',
    accent: '#14b8a6', tag: 'Community', x: 930, y: 188,
  },
  {
    id: 'edulis', to: '/Edulis',
    img: '/EdulisLogo.png', imgFit: 'contain',
    title: 'Edulis Labs', desc: 'A GTM strategy for a startup challenging norms.',
    accent: '#a855f7', tag: 'GTM Strategy', x: 1215, y: 210,
  },
  // ── Row 2: Fork — investing vs operating ─────────────────────────
  {
    id: 'crater', href: 'https://crater.vc/',
    img: '/crater.jpeg', imgFit: 'cover',
    title: 'Crescent Fund & Crater', desc: "Investing in SoCal's biggest dreamers.",
    accent: '#10b981', tag: 'VC', x: 60, y: 854, w: 285, h: 245,
  },
  {
    id: 'madison', href: 'https://trueventures.com',
    img: '/TVLogo2.jpg', imgFit: 'contain',
    title: 'Madison Reed & True Ventures', desc: 'Data science as part of True Ventures Fellowship.',
    accent: '#8b5cf6', tag: 'Data Science', x: 570, y: 820, w: 310, h: 245,
  },
  {
    id: 'verita', href: 'https://verita-ai.com',
    img: '/Verita.png', imgFit: 'contain',
    title: 'Verita AI', desc: 'Special Projects Lead at a multimodal data startup.',
    accent: '#f59e0b', tag: 'Operations', x: 975, y: 860, w: 270, h: 245,
  },
  {
    id: 'instalily', href: 'https://www.instalily.ai/',
    img: '/instalily-logo.png', imgFit: 'contain',
    title: 'InstaLILY', desc: 'Growth at an AI startup for the physical economy.',
    accent: '#3b82f6', tag: 'AI Startup', x: 1258, y: 832, w: 270, h: 245,
  },
  // ── Row 3: Fun & beyond ──────────────────────────────────────────
  {
    id: 'frarytale', to: '/FraryTale',
    img: '/FraryTale_resized_16_9.png', imgFit: 'cover',
    title: 'Frary Tale', desc: 'Documenting journeys with Claremont Entrepreneurs.',
    accent: '#f43f5e', tag: 'Storytelling', x: 60, y: 1290, w: 270, h: 235,
  },
  {
    id: 'coldplay', to: '/coldplay',
    img: '/parachutes.png', imgFit: 'cover',
    title: 'Coldplay', desc: 'My favorite band of all time.',
    accent: '#f59e0b', tag: 'Music', x: 630, y: 1318, w: 270, h: 235,
  },
  {
    id: 'ground', to: '/Ground',
    img: '/Ground.png', imgFit: 'contain',
    title: 'Ground', desc: 'An accessible way to ground ourselves in the present.',
    accent: '#4ade80', tag: 'Wellness', x: 1190, y: 1268, w: 270, h: 235,
  },
];

// ── Info / narrative card data ────────────────────────────────────────

interface InfoCardData {
  id: string;
  title: string;
  body: string;
  accent: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tilt?: number;
}

const INFO_CARDS: InfoCardData[] = [
  {
    id: 'about_me',
    title: "Hi, I'm Jay.",
    body: "A student at the Claremont Colleges, passionate about human-centered design and startups. I love finding real problems and figuring out how to solve them.",
    accent: '#a855f7',
    x: 580, y: 20, w: 380, h: 118,
    tilt: -0.8,
  },
  {
    id: 'college_transition',
    title: 'All of this happened in college.',
    body: "These experiences shaped a deep love for startups — both building and investing. I wanted to be in rooms where I could learn fast, move with urgency, and keep humans at the center.",
    accent: '#6366f1',
    x: 545, y: 540, w: 450, h: 148,
    tilt: 1.0,
  },
  {
    id: 'theme_ai_humans',
    title: 'A consistent thread.',
    body: "Across every role — investing, operating, building — I've kept technology, AI, data, and people at the center of how I work.",
    accent: '#0ea5e9',
    x: 550, y: 1120, w: 440, h: 122,
    tilt: -0.7,
  },
];

// ── Precomputed centers for arrow routing ─────────────────────────────

const CENTERS: Record<string, { x: number; y: number }> = {};
CARDS.forEach(c => {
  CENTERS[c.id] = { x: c.x + (c.w ?? CARD_W) / 2, y: c.y + (c.h ?? CARD_H) / 2 };
});
INFO_CARDS.forEach(c => {
  CENTERS[c.id] = { x: c.x + c.w / 2, y: c.y + c.h / 2 };
});

interface ConnectionDef {
  from: string;
  to: string;
  color: string;
}

const CONNECTIONS: ConnectionDef[] = [
  // HCD chain (chronological)
  { from: 'saver',      to: 'sparkathon', color: '#84cc16' },
  { from: 'sparkathon', to: 'crosscamp',  color: '#0ea5e9' },
  { from: 'crosscamp',  to: 'intergen',   color: '#6366f1' },
  { from: 'intergen',   to: 'edulis',     color: '#14b8a6' },
  // Investing chain
  { from: 'crater',     to: 'madison',    color: '#10b981' },
  // Bridge → operating
  { from: 'madison',    to: 'instalily',  color: '#8b5cf6' },
  // Operating chain
  { from: 'verita',     to: 'instalily',  color: '#f59e0b' },
  // Fun: Frary Tale connected to Sparkathon
  { from: 'sparkathon', to: 'frarytale',  color: '#f43f5e' },
];

// ── Story step definitions ────────────────────────────────────────────

// zoom: -1 = sentinel for "auto-fit full canvas" (computed at render time)
interface Camera { cx: number; cy: number; zoom: number; }

interface StepDef {
  cards?: string[];
  infoCards?: string[];
  arrows?: number[];   // indices into CONNECTIONS
  svgElements?: Array<'circle' | 'circle_arrow' | 'bracket_arrow' | 'bracket' | 'ticks' | 'labels'>;
  camera: Camera;
}

const STEPS: StepDef[] = [
  // 0 — intro
  { infoCards: ['about_me'],          camera: { cx: 770,  cy: 80,   zoom: 2.0  } },
  // 1-5 — HCD cards appear left→right
  { cards: ['saver'],                 camera: { cx: 205,  cy: 320,  zoom: 2.0  } },
  { cards: ['sparkathon'], arrows: [0], camera: { cx: 490,  cy: 295, zoom: 1.9  } },
  { cards: ['crosscamp'],  arrows: [1], camera: { cx: 770,  cy: 310, zoom: 1.8  } },
  { cards: ['intergen'],   arrows: [2], camera: { cx: 1060, cy: 305, zoom: 1.8  } },
  { cards: ['edulis'],     arrows: [3], camera: { cx: 1335, cy: 320, zoom: 1.9  } },
  // 6 — circle draws around all 5 HCD cards (zoom out to see full ellipse)
  { svgElements: ['circle'],          camera: { cx: 770,  cy: 315,  zoom: 1.05 } },
  // 7 — arrow: circle bottom → transition card
  { svgElements: ['circle_arrow'],    camera: { cx: 770,  cy: 430,  zoom: 1.3  } },
  // 8 — "All of this happened in college"
  { infoCards: ['college_transition'],camera: { cx: 770,  cy: 620,  zoom: 1.6  } },
  // 9 — arrow: transition → bracket peak
  { svgElements: ['bracket_arrow'],   camera: { cx: 770,  cy: 730,  zoom: 1.5  } },
  // 10 — bracket arch draws left→right
  { svgElements: ['bracket'],         camera: { cx: 770,  cy: 800,  zoom: 1.4  } },
  // 11 — tick marks + cluster labels appear
  { svgElements: ['ticks', 'labels'], camera: { cx: 770,  cy: 835,  zoom: 1.3  } },
  // 12-15 — startup cards pan left→right
  { cards: ['crater'],                camera: { cx: 205,  cy: 960,  zoom: 2.0  } },
  { cards: ['madison'],               camera: { cx: 725,  cy: 945,  zoom: 1.9  } },
  { cards: ['verita'],                camera: { cx: 1115, cy: 965,  zoom: 2.0  } },
  { cards: ['instalily'],             camera: { cx: 1395, cy: 950,  zoom: 2.0  } },
  // 16-17 — startup arrows
  { arrows: [4],                      camera: { cx: 465,  cy: 955,  zoom: 1.5  } },
  { arrows: [5, 6],                   camera: { cx: 1100, cy: 950,  zoom: 1.4  } },
  // 18 — "A consistent thread"
  { infoCards: ['theme_ai_humans'],   camera: { cx: 770,  cy: 1155, zoom: 1.6  } },
  // 19-21 — fun row pan left→right
  { cards: ['frarytale'], arrows: [7],camera: { cx: 200,  cy: 1390, zoom: 1.9  } },
  { cards: ['coldplay'],              camera: { cx: 770,  cy: 1435, zoom: 1.9  } },
  { cards: ['ground'],                camera: { cx: 1330, cy: 1390, zoom: 1.9  } },
];

const MAX_STEP    = STEPS.length; // 23
const PX_PER_STEP = 400;          // pixels of scroll per story step

function computeVisible(step: number) {
  const cards     = new Set<string>();
  const infoCards = new Set<string>();
  const arrows    = new Set<number>();
  const svg       = new Set<string>();
  for (let i = 0; i <= Math.min(step, MAX_STEP - 1); i++) {
    const s = STEPS[i];
    s.cards?.forEach(id => cards.add(id));
    s.infoCards?.forEach(id => infoCards.add(id));
    s.arrows?.forEach(idx => arrows.add(idx));
    s.svgElements?.forEach(el => svg.add(el));
  }
  return { cards, infoCards, arrows, svg };
}

const ALL_VISIBLE = {
  cards:     new Set(CARDS.map(c => c.id)),
  infoCards: new Set(INFO_CARDS.map(c => c.id)),
  arrows:    new Set(CONNECTIONS.map((_, i) => i)),
  svg:       new Set<string>(['circle','circle_arrow','bracket_arrow','bracket','ticks','labels']),
};

// ── Doodle system ─────────────────────────────────────────────────────

const DOODLE_PATHS: Record<string, string> = {
  sparkle:    'M12 2l1.2 8.8L22 12l-8.8 1.2L12 22l-1.2-8.8L2 12l8.8-1.2z',
  star:       'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  heart:      'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  lightbulb:  'M9 21h6m-5 0v2h4v-2M12 3C8.69 3 6 5.69 6 9c0 2.39 1.31 4.47 3.25 5.57V21h5.5v-6.43C16.69 13.47 18 11.39 18 9c0-3.31-2.69-6-6-6z',
  music:      'M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm12-2c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z',
  lightning:  'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  gear:       'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.22-2.08c.04-.29.07-.6.07-.92s-.03-.63-.07-.92l2-1.56a.48.48 0 0 0 .11-.62l-1.9-3.28a.48.48 0 0 0-.58-.21l-2.36.95a6.9 6.9 0 0 0-1.6-.93L13.6 2.4A.47.47 0 0 0 13.13 2h-2.26a.47.47 0 0 0-.47.4l-.36 2.54c-.57.23-1.12.55-1.6.93l-2.36-.95a.48.48 0 0 0-.58.21L3.6 8.4a.47.47 0 0 0 .12.62l2 1.56c-.04.3-.07.6-.07.92s.03.62.07.92l-2 1.56a.48.48 0 0 0-.11.62l1.9 3.28c.12.21.37.29.58.21l2.36-.95c.48.38 1.03.7 1.6.93l.36 2.54c.06.23.27.4.47.4h2.26c.2 0 .41-.17.47-.4l.36-2.54c.57-.23 1.12-.55 1.6-.93l2.36.95c.21.08.46 0 .58-.21l1.9-3.28a.47.47 0 0 0-.12-.62l-2-1.56z',
  magnify:    'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2l-4.35-4.35',
  chart_bars: 'M18 20V10M12 20V4M6 20v-6',
  rocket:     'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zm-3-3H4s.55-3.03 2-4c1.62-1.08 5 0 5 0m9 3v5s-3.03.55-4-2c-1.08-1.62 0-5 0-5',
  leaf:       'M17 8C8 10 5.9 16.17 3.82 22L5.71 21a26 26 0 0 0 3-6.87c2.56 1.37 5.53.83 7.65-1.29C18.36 11.84 18 8 18 8z',
  globe:      'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20',
  pencil:     'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z',
  coffee:     'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zm4-7v3m4-3v3m4-3v3',
  camera:     'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  branch:     'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9s0 6-6 6H8.5',
  wave:       'M2 15 C6 15 6 9 12 9 C18 9 18 15 22 15',
  plant:      'M12 22V12M12 12C9 8 5 8 4 10c4 0 6 3 8 7M12 12c3-4 7-4 8-2-4 0-6 3-8 7',
  headphones: 'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',
};

interface DoodleItem {
  type: keyof typeof DOODLE_PATHS;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation?: number;
  opacity?: number;
}

const DOODLES: DoodleItem[] = [
  // ── Left margin ───────────────────────────────────────────────────
  { type: 'heart',      x: 36,   y: 315,  size: 32, color: '#14b8a6', opacity: 0.22 },  // HCD center
  { type: 'chart_bars', x: 36,   y: 963,  size: 40, color: '#10b981', opacity: 0.22 },  // startup center
  { type: 'camera',     x: 36,   y: 1398, size: 40, color: '#f43f5e', opacity: 0.20 },  // fun center
  // ── Right margin ──────────────────────────────────────────────────
  { type: 'pencil',     x: 1510, y: 315,  size: 36, color: '#a855f7', opacity: 0.22 },  // HCD right
  { type: 'plant',      x: 1510, y: 1398, size: 44, color: '#4ade80', opacity: 0.22 },  // fun right
  // ── Flanking college_transition (center y=614) ────────────────────
  { type: 'star',       x: 200,  y: 614,  size: 28, color: '#84cc16', opacity: 0.22 },
  { type: 'lightbulb',  x: 1200, y: 614,  size: 36, color: '#0ea5e9', opacity: 0.22 },
  // ── Startup row inter-card gaps ───────────────────────────────────
  { type: 'branch',     x: 450,  y: 963,  size: 38, color: '#8b5cf6', opacity: 0.20 },
  { type: 'gear',       x: 900,  y: 963,  size: 38, color: '#f59e0b', opacity: 0.20 },
  // ── Flanking theme box (center y=1181) ───────────────────────────
  { type: 'rocket',     x: 200,  y: 1181, size: 36, color: '#3b82f6', opacity: 0.20 },
  { type: 'globe',      x: 1200, y: 1181, size: 34, color: '#14b8a6', opacity: 0.20 },
  // ── Fun row ───────────────────────────────────────────────────────
  { type: 'music',      x: 480,  y: 1290, size: 46, color: '#f59e0b', opacity: 0.22 },
  { type: 'headphones', x: 765,  y: 1302, size: 38, color: '#f59e0b', opacity: 0.20 },
  { type: 'leaf',       x: 1090, y: 1272, size: 36, color: '#4ade80', opacity: 0.20 },
];

const Doodle: React.FC<DoodleItem> = ({ type, x, y, size, color, rotation = 0, opacity = 0.25 }) => {
  const d = DOODLE_PATHS[type as string];
  if (!d) return null;
  return (
    <svg
      style={{
        position: 'absolute',
        left: x - size / 2, top: y - size / 2,
        width: size, height: size,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        pointerEvents: 'none', opacity, overflow: 'visible',
      }}
      viewBox="0 0 24 24"
    >
      <path d={d} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Bezier helper ─────────────────────────────────────────────────────

function quadCP(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const perp = Math.min(len * 0.2, 90);
  return { cx: mx - (dy / len) * perp, cy: my + (dx / len) * perp };
}

// ── Per-card tilt config ──────────────────────────────────────────────

const CARD_CONFIGS: Record<string, { tilt: number }> = {
  edulis:     { tilt: -2.1 }, intergen:   { tilt:  1.8 },
  crosscamp:  { tilt: -1.4 }, saver:      { tilt:  2.3 },
  sparkathon: { tilt: -0.9 }, instalily:  { tilt:  1.5 },
  verita:     { tilt: -2.4 }, madison:    { tilt:  1.1 },
  crater:     { tilt: -1.7 }, frarytale:  { tilt:  2.0 },
  ground:     { tilt: -1.3 }, coldplay:   { tilt:  2.6 },
};

// ── Info / narrative card ─────────────────────────────────────────────

const InfoCard: React.FC<InfoCardData & { show?: boolean; animated?: boolean }> = ({
  title, body, accent, x, y, w, h, tilt = 0, show = true, animated = false,
}) => {
  const tSide = tilt >= 0 ? 1 : -1;
  const shadow = `${tSide * 4}px 6px 0 ${accent}20, ${tSide * 8}px 12px 22px ${accent}12`;
  const radius = tilt >= 0
    ? '12px 160px 14px 155px / 155px 14px 160px 12px'
    : '160px 12px 155px 14px / 14px 155px 12px 160px';
  const hidden = animated && !show;

  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      transform: hidden ? `rotate(${tilt}deg) translateY(14px)` : `rotate(${tilt}deg)`,
      opacity: hidden ? 0 : 1,
      transition: animated ? 'opacity 0.5s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1)' : undefined,
      boxShadow: shadow,
      borderRadius: radius,
      border: `1.5px solid ${accent}77`,
      background: `linear-gradient(150deg, #fffefb 0%, ${accent}0d 100%)`,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ height: 5, background: accent, opacity: 0.65, flexShrink: 0 }} />
      <div style={{
        flex: 1, padding: '10px 18px 13px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
      }}>
        <div className="font-patrick" style={{ fontSize: 15, lineHeight: 1.2, color: '#1a1008' }}>
          {title}
        </div>
        <div className="font-beezee" style={{ fontSize: 11.5, lineHeight: 1.48, color: 'rgba(26,16,8,0.56)' }}>
          {body}
        </div>
      </div>
    </div>
  );
};

// ── Project / sketch card ─────────────────────────────────────────────

const SketchCard: React.FC<CardData & { show?: boolean; animated?: boolean }> = ({
  id, to, href, img, imgFit = 'contain', title, desc, accent, tag, x, y, w: cw, h: ch,
  show = true, animated = false,
}) => {
  const W = cw ?? CARD_W;
  const H = ch ?? CARD_H;
  const { tilt } = CARD_CONFIGS[id] ?? { tilt: 0 };
  const hidden = animated && !show;

  const radius = tilt > 0
    ? '14px 240px 16px 235px / 235px 16px 240px 14px'
    : '240px 14px 235px 16px / 16px 235px 14px 240px';

  const imgH = Math.round(H * 0.45);
  const tSide = tilt > 0 ? 1 : -1;
  const baseShadow  = `${tSide * 5}px 7px 0 ${accent}28, ${tSide * 9}px 14px 26px ${accent}18`;
  const hoverShadow = `${tSide * 6}px 9px 0 ${accent}44, ${tSide * 11}px 20px 34px ${accent}28`;

  const onEnter = animated ? undefined : (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = `rotate(${tilt}deg) translateY(-8px)`;
    e.currentTarget.style.boxShadow = hoverShadow;
    e.currentTarget.style.zIndex = '20';
  };
  const onLeave = animated ? undefined : (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = `rotate(${tilt}deg)`;
    e.currentTarget.style.boxShadow = baseShadow;
    e.currentTarget.style.zIndex = '';
  };

  const body = (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: imgH, flexShrink: 0, background: `${accent}12`, position: 'relative' }}>
        <img
          src={img} alt={title}
          style={{ width: '100%', height: '100%', objectFit: imgFit === 'cover' ? 'cover' : 'contain', display: 'block' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 26,
          background: 'linear-gradient(transparent, rgba(255,254,251,0.65))',
          pointerEvents: 'none',
        }} />
      </div>
      <div style={{
        flex: 1, padding: '12px 16px 14px',
        display: 'flex', flexDirection: 'column', gap: 5, background: '#fffefb',
      }}>
        <div className="font-beezee" style={{
          fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: accent, display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <svg width="5" height="5" viewBox="0 0 5 5" style={{ flexShrink: 0 }}>
            <circle cx="2.5" cy="2.5" r="2.5" fill={accent} />
          </svg>
          {tag}
        </div>
        <div className="font-patrick" style={{ fontSize: 15.5, lineHeight: 1.2, color: '#1a1008' }}>
          {title}
        </div>
        <div className="font-beezee" style={{
          fontSize: 11.5, lineHeight: 1.42, color: 'rgba(26,16,8,0.50)',
          overflow: 'hidden', maxHeight: '3.6em',
        }}>
          {desc}
        </div>
      </div>
    </div>
  );

  return (
    <div
      onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{
        position: 'absolute', left: x, top: y, width: W, height: H,
        transform: hidden
          ? `rotate(${tilt}deg) scale(0.88) translateY(18px)`
          : `rotate(${tilt}deg)`,
        opacity: hidden ? 0 : 1,
        boxShadow: baseShadow,
        transition: animated
          ? 'opacity 0.45s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1)'
          : 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s',
        cursor: animated && !show ? 'default' : 'pointer',
        borderRadius: radius,
        border: `2px solid ${accent}bb`,
        background: '#fffefb',
        overflow: 'hidden',
        pointerEvents: animated && !show ? 'none' : 'auto',
      }}
    >
      {to
        ? <Link to={to} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>{body}</Link>
        : <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>{body}</a>
      }
    </div>
  );
};

// ── MapCanvas — shared canvas interior for both map and story modes ───

interface VisibleSets {
  cards: Set<string>;
  infoCards: Set<string>;
  arrows: Set<number>;
  svg: Set<string>;
}

const MapCanvas: React.FC<VisibleSets & { animated: boolean }> = ({
  cards: visCards, infoCards: visInfo, arrows: visArrows, svg: visSvg, animated,
}) => {
  // Precompute arrow paths
  const arrowPaths = CONNECTIONS.map((conn, i) => {
    const A = CENTERS[conn.from], B = CENTERS[conn.to];
    if (!A || !B) return null;
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
    const dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perp = Math.min(len * 0.2, 90);
    const cx = mx - (dy / len) * perp, cy = my + (dx / len) * perp;
    return { ...conn, d: `M ${A.x} ${A.y} Q ${cx} ${cy} ${B.x} ${B.y}`, idx: i };
  });

  // SVG draw-on animation helper (for paths without arrowheads: circle, bracket)
  const drawPath = (el: string) => animated ? {
    pathLength: 1 as const,
    strokeDasharray: 1 as const,
    strokeDashoffset: visSvg.has(el) ? 0 : 1,
    style: { transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)' },
  } : {};

  // Opacity-fade helper (for arrows with arrowheads, tick marks)
  const fadeEl = (el: string): React.CSSProperties => animated ? {
    opacity: visSvg.has(el) ? 1 : 0,
    transition: 'opacity 0.5s ease',
  } : {};
  const fadeArrow = (idx: number): React.CSSProperties => animated ? {
    opacity: visArrows.has(idx) ? 1 : 0,
    transition: 'opacity 0.5s ease',
  } : {};

  return (
    <>
      {/* ── SVG layer ──────────────────────────────────────────────── */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
        <defs>
          {arrowPaths.map((a, i) => a && (
            <marker key={i} id={`ah-${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <polygon points="0,0 0,6 8,3" fill={a.color} opacity="0.75" />
            </marker>
          ))}
          <marker id="ah-indigo" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0,0 0,6 8,3" fill="rgba(99,102,241,0.75)" />
          </marker>
          <marker id="ah-plum" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0,0 0,6 8,3" fill="rgba(80,60,140,0.70)" />
          </marker>
        </defs>

        {/* Dynamic arrows */}
        {arrowPaths.map(a => a && (
          <path key={a.idx} d={a.d}
            stroke={a.color} strokeWidth="2.2" strokeOpacity="0.6"
            fill="none" strokeLinecap="round"
            markerEnd={`url(#ah-${a.idx})`}
            style={fadeArrow(a.idx)}
          />
        ))}

        {/* Hand-drawn ellipse around HCD row */}
        <path
          d="M 772 158 C 1180 153 1515 228 1517 316 C 1519 402 1185 472 770 473 C 354 474 19 402 21 314 C 23 226 362 155 772 158"
          stroke="rgba(99,102,241,0.38)" strokeWidth="2.8"
          fill="none" strokeLinecap="round" strokeLinejoin="round"
          {...drawPath('circle')}
        />

        {/* Arrow: ellipse bottom → college_transition */}
        <path d="M 772 473 Q 780 506 770 537"
          stroke="rgba(99,102,241,0.58)" strokeWidth="2"
          fill="none" strokeLinecap="round"
          markerEnd="url(#ah-indigo)"
          style={fadeEl('circle_arrow')}
        />

        {/* Arrow: college_transition → bracket peak */}
        <path d="M 770 688 Q 782 736 797 780"
          stroke="rgba(80,60,140,0.52)" strokeWidth="2"
          fill="none" strokeLinecap="round"
          markerEnd="url(#ah-plum)"
          style={fadeEl('bracket_arrow')}
        />

        {/* Bracket arch */}
        <path d="M 202 818 Q 797 748 1393 818"
          stroke="rgba(80,60,140,0.42)" strokeWidth="2.5"
          fill="none" strokeLinecap="round"
          {...drawPath('bracket')}
        />

        {/* Tick marks */}
        {['202,818,202,852','725,784,725,818','1110,792,1110,858','1393,818,1393,830'].map((coords, i) => {
          const [x1,y1,x2,y2] = coords.split(',').map(Number);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(80,60,140,0.32)" strokeWidth="1.8" strokeLinecap="round"
              style={fadeEl('ticks')}
            />
          );
        })}
      </svg>

      {/* ── Annotations ──────────────────────────────────────────── */}
      <div className="font-beezee" style={{ position:'absolute', left:75, top:173, fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(26,16,8,0.30)', pointerEvents:'none' }}>
        the beginning — human-centered design
      </div>
      {/* Cluster labels */}
      {(['investing','investing + operating','operating'] as const).map((label, i) => (
        <div key={label} className="font-beezee" style={{
          position:'absolute', left:[65,571,976][i], top:800, fontSize:8.5,
          letterSpacing:'0.14em', textTransform:'uppercase', pointerEvents:'none',
          color:['#10b981cc','#8b5cf6cc','#f59e0bcc'][i],
          opacity: animated ? (visSvg.has('labels') ? 1 : 0) : 1,
          transition: animated ? 'opacity 0.5s ease' : undefined,
        }}>
          {label}
        </div>
      ))}
      {/* Fun row labels */}
      <div className="font-beezee" style={{ position:'absolute', left:65, top:1244, fontSize:9.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(26,16,8,0.26)', pointerEvents:'none' }}>& beyond</div>
      <div className="font-patrick" style={{ position:'absolute', left:642, top:1292, fontSize:11.5, color:'rgba(26,16,8,0.28)', transform:'rotate(1.6deg)', pointerEvents:'none' }}>♥ just for love</div>
      <div className="font-beezee" style={{ position:'absolute', left:1192, top:1244, fontSize:8.5, letterSpacing:'0.12em', textTransform:'uppercase', color:'#4ade80cc', pointerEvents:'none' }}>startup project</div>

      {/* Doodles */}
      {DOODLES.map((d, i) => <Doodle key={i} {...d} />)}

      {/* Info / narrative cards */}
      {INFO_CARDS.map(c => (
        <InfoCard key={c.id} {...c} show={visInfo.has(c.id)} animated={animated} />
      ))}

      {/* Project cards */}
      {CARDS.map(c => (
        <SketchCard key={c.id} {...c} show={visCards.has(c.id)} animated={animated} />
      ))}
    </>
  );
};

// ── Hero Section ──────────────────────────────────────────────────────

const HeroSection: React.FC<{ onScrollDown: () => void }> = ({ onScrollDown }) => (
  <section style={{
    height: '100vh',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  }}>
    <div className="text-center px-8" style={{ maxWidth: 780 }}>
      <motion.h1
        className="font-patrick text-[#001d36] font-bold"
        style={{ fontSize: 'clamp(3.2rem, 7.5vw, 6rem)', lineHeight: 1.05, marginBottom: '1rem' }}
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.88, delay: 0.12, ease: 'easeOut' }}
      >
        Hi, I'm Jay!
      </motion.h1>
      <motion.h2
        className="font-beezee text-[#001d36]"
        style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)', lineHeight: 1.45, opacity: 0.88 }}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
      >
        I bring a{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-teal-400 to-lime-500">
          human-centered
        </span>{' '}
        approach to find and tackle real problems.
      </motion.h2>
    </div>

    <motion.button
      onClick={onScrollDown}
      className="font-beezee text-[#001d36] hover:text-lime-500"
      style={{
        position: 'absolute', bottom: 36,
        left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255,255,255,0.65)',
        borderRadius: 40, padding: '11px 30px',
        cursor: 'pointer', fontSize: 17,
        boxShadow: '0 4px 20px rgba(0,29,54,0.08)',
        transition: 'color 0.2s', whiteSpace: 'nowrap',
      }}
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      initial={{ opacity: 0 }}
    >
      <img src="/arrow-fat-down.svg" alt="" style={{ width: 22, height: 22 }} />
      explore my work
    </motion.button>
  </section>
);

// ── Map HUD (story mode only: play/pause + show all) ─────────────────

const hudBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 17, border: 'none',
  background: 'rgba(99,102,241,0.10)', cursor: 'pointer',
  fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.15s', color: '#1a1008',
};

const MapHUD: React.FC<{ isPlaying: boolean; onPlay: () => void; onShowAll: () => void }> = ({
  isPlaying, onPlay, onShowAll,
}) => (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 110,
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 40,
    padding: '5px 8px',
    boxShadow: '0 4px 24px rgba(99,102,241,0.13)',
    fontFamily: 'ABeeZee, sans-serif',
  }}>
    <button onClick={onPlay} style={hudBtn}>{isPlaying ? '⏸' : '▶'}</button>
    <button onClick={onShowAll} style={{ ...hudBtn, width: 'auto', padding: '0 12px', borderRadius: 20, fontSize: 12 }}>
      Show all
    </button>
  </div>
);

// ── Map Section ───────────────────────────────────────────────────────

const MapSection: React.FC<{ mode: 'story' | 'map'; step: number }> = ({ mode, step }) => {
  const [vpSize, setVpSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setVpSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const visible = useMemo(() => computeVisible(step), [step]);

  if (mode === 'story') {
    const baseScale = Math.min(1, vpSize.w / CANVAS_W);
    const fullZoom  = Math.min(
      vpSize.w / (CANVAS_W * baseScale),
      vpSize.h / (CANVAS_H * baseScale),
    ) * 0.90;
    const cam        = STEPS[Math.min(step, MAX_STEP - 1)].camera;
    const zoom       = cam.zoom < 0 ? fullZoom : cam.zoom;
    const totalScale = baseScale * zoom;
    const tx         = vpSize.w / 2 - cam.cx * totalScale;
    const ty         = vpSize.h / 2 - cam.cy * totalScale;

    return (
      <section style={{ height: `${MAX_STEP * PX_PER_STEP + vpSize.h}px` }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', width: CANVAS_W, height: CANVAS_H,
            transform: `translate(${tx}px, ${ty}px) scale(${totalScale})`,
            transformOrigin: '0 0',
            transition: 'transform 0.80s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            background: 'rgba(235,228,255,0.40)', backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)', borderRadius: 24,
            boxShadow: '0 2px 40px rgba(140,110,255,0.08)',
          }}>
            <MapCanvas {...visible} animated={true} />
          </div>
        </div>
      </section>
    );
  }

  // Map mode — all visible, scale to fit width
  const mapScale = Math.min(1, vpSize.w * 0.95 / CANVAS_W);
  return (
    <section style={{
      padding: '60px 0 80px', overflow: 'hidden',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    }}>
      <div style={{
        position: 'relative', width: CANVAS_W, height: CANVAS_H, flexShrink: 0,
        transform: `scale(${mapScale})`, transformOrigin: 'top center',
        marginBottom: `${(mapScale - 1) * CANVAS_H}px`,
        background: 'rgba(235,228,255,0.42)', backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)', borderRadius: 24,
        boxShadow: '0 2px 40px rgba(140,110,255,0.08)',
      }}>
        <MapCanvas {...ALL_VISIBLE} animated={false} />
      </div>
    </section>
  );
};

// ── Aurora overlay ────────────────────────────────────────────────────

const MapAurora: React.FC = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    background: [
      'radial-gradient(ellipse 90% 70% at 15% 25%, rgba(168,85,247,0.22) 0%, transparent 55%)',
      'radial-gradient(ellipse 70% 60% at 85% 65%, rgba(20,184,166,0.20) 0%, transparent 55%)',
      'radial-gradient(ellipse 80% 50% at 55% 88%, rgba(132,204,22,0.16) 0%, transparent 55%)',
      'radial-gradient(ellipse 60% 70% at 38% 10%, rgba(59,130,246,0.16) 0%, transparent 50%)',
    ].join(','),
  }} />
);

// ── MapHome ───────────────────────────────────────────────────────────

const MapHome: React.FC = () => {
  const containerRef     = useRef<HTMLDivElement>(null);
  const isPlayingRef     = useRef(false);
  const autoScrollingRef = useRef(false);

  const [mode,      setMode]      = useState<'story' | 'map'>('story');
  const [step,      setStep]      = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Keep ref in sync for use inside event handlers
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const scrollToMap = useCallback(() => {
    containerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }, []);

  // Scroll → step (story mode only; programmatic autoscroll is ignored)
  useEffect(() => {
    if (mode !== 'story') return;
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      if (autoScrollingRef.current) return;
      // Manual scroll stops autoplay
      if (isPlayingRef.current) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
      const vpH = window.innerHeight;
      const inSection = container.scrollTop - vpH;
      const rawStep = Math.floor(inSection / PX_PER_STEP);
      // Past the last step — auto-switch to map mode (same as "Show all")
      if (rawStep >= MAX_STEP) {
        setMode('map');
        setIsPlaying(false);
        container.scrollTo({ top: vpH, behavior: 'smooth' });
        return;
      }
      const newStep = Math.max(rawStep, 0);
      setStep(newStep);
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [mode]);

  // Autoplay: advance step on timer and scroll to keep position in sync
  useEffect(() => {
    if (!isPlaying || mode !== 'story') return;
    const t = setInterval(() => {
      setStep(s => {
        if (s >= MAX_STEP - 1) { setIsPlaying(false); return s; }
        const next = s + 1;
        const container = containerRef.current;
        if (container) {
          autoScrollingRef.current = true;
          container.scrollTo({ top: window.innerHeight + next * PX_PER_STEP, behavior: 'smooth' });
          setTimeout(() => { autoScrollingRef.current = false; }, 1000);
        }
        return next;
      });
    }, 1800);
    return () => clearInterval(t);
  }, [isPlaying, mode]);

  const showAll = useCallback(() => {
    setMode('map');
    setIsPlaying(false);
    containerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }, []);

  const backToStory = useCallback(() => {
    setMode('story');
    setStep(0);
    containerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto' }}>
      <MapAurora />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection onScrollDown={scrollToMap} />
        <MapSection mode={mode} step={step} />
      </div>

      {/* Story mode HUD: ▶/⏸ + Show all */}
      {mode === 'story' && (
        <MapHUD isPlaying={isPlaying} onPlay={togglePlay} onShowAll={showAll} />
      )}

      {/* Map mode: back to story */}
      {mode === 'map' && (
        <button onClick={backToStory} style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 110,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 40,
          padding: '10px 20px', cursor: 'pointer', fontSize: 14,
          boxShadow: '0 4px 24px rgba(99,102,241,0.13)',
          fontFamily: 'ABeeZee, sans-serif', color: '#1a1008',
        }}>
          ▶ Story
        </button>
      )}
    </div>
  );
};

export default MapHome;
