import { useEffect, useRef, useState } from 'react';
import { RevealText } from './ui/reveal-text';

// ── Virtual coordinate space ──────────────────────────────
const VW = 800;
const VH = 450;
const GROUND      = 345;
const STANDS_H    = 90;                  // height of the bleacher block
const STANDS_TOP  = GROUND - STANDS_H;  // top edge of stands = 255

// Goal — side-profile view: front post at GOAL_X, net extends right by GOAL_DEPTH
const GOAL_DEPTH = 70;   // how far the net extends to the right
const GOAL_X     = VW - GOAL_DEPTH - 2; // front post, net runs to right edge
const GOAL_H     = 128;
const GOAL_TOP   = GROUND - GOAL_H;
const GOAL_SLOPE = GOAL_DEPTH * 0.07; // subtle downward angle on top bar (perspective)

// Physics
const BALL_R      = 11;
const GRAVITY     = 0.38;
const FRICTION    = 0.987;
const GND_DAMP    = 0.52;
const WALL_DAMP   = 0.72;

// Player
const PLAYER_SPD  = 5.5;
const PLAYER_H    = 34;
const HEAD_R      = 11;
const KICK_DIST   = BALL_R + 17;

type Phase = 'playing' | 'celebrating' | 'dropping';

interface GS {
  bx: number; by: number; bvx: number; bvy: number; brot: number;
  kickTimer: number;
  trail: { x: number; y: number }[];
  px: number; pvx: number;
  score: number;
  phase: Phase;
  timer: number;
  keys: { l: boolean; r: boolean };
  crowd: { x: number; y: number; ph: number; hue: number; sz: number }[];
}

function mkState(): GS {
  const crowd: GS['crowd'] = [];
  // 4 rows sitting in the stands — bottom row rests on GROUND
  const rowSpacing = Math.floor(STANDS_H / 4);
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 37; col++)
      crowd.push({
        x: col * 22 + 4,
        y: STANDS_TOP + 6 + row * rowSpacing,
        ph: Math.random() * Math.PI * 2,
        hue: Math.floor(Math.random() * 360),
        sz: 4.5 + Math.random() * 2,
      });
  return {
    // Ball starts at center
    bx: VW / 2, by: GROUND - BALL_R, bvx: 0, bvy: 0, brot: 0,
    kickTimer: 0, trail: [],
    // Player starts right next to ball (left side)
    px: VW / 2 - 28, pvx: 0,
    score: 0, phase: 'playing', timer: 0,
    keys: { l: false, r: false }, crowd,
  };
}

// ── Draw soccer ball (spots pattern) ─────────────────────
function drawSoccerBall(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  rot: number, kickTimer: number,
) {
  const kt = kickTimer / 12;
  const sx = 1 + kt * 0.38;
  const sy = 1 - kt * 0.26;

  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(rot);
  ctx.scale(sx, sy);

  // Clean white ball with black outline only
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

// ── Rounded pill helper ───────────────────────────────────
function pillRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
}

export function SoccerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const gs        = useRef<GS>(mkState());
  const raf       = useRef<number>();
  const [goalKey,    setGoalKey]    = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = wrap.clientWidth;
      canvas.height = wrap.clientWidth * (VH / VW);
    };
    resize();
    window.addEventListener('resize', resize);

    const g = gs.current;
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  { g.keys.l = true;  e.preventDefault(); }
      if (e.key === 'ArrowRight') { g.keys.r = true;  e.preventDefault(); }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  g.keys.l = false;
      if (e.key === 'ArrowRight') g.keys.r = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);


    // ── Update ─────────────────────────────────────────────
    const update = () => {
      const s = gs.current;
      s.trail = s.trail ?? [];   // guard against stale ref shape on hot-reload

      if (s.phase === 'celebrating') {
        s.timer++;
        if (s.timer > 100) {
          s.phase = 'dropping';
          s.bx = VW / 2; s.by = -60;
          s.bvx = 0; s.bvy = 0;
          s.trail = []; s.timer = 0;
          setCelebrating(false);
        }
        return;
      }

      // Player moves during drop too
      s.pvx = s.keys.l ? -PLAYER_SPD : s.keys.r ? PLAYER_SPD : 0;
      s.px  = Math.max(20, Math.min(VW - 20, s.px + s.pvx));

      if (s.phase === 'dropping') {
        s.bvy += GRAVITY;
        s.by  += s.bvy;
        if (s.by + BALL_R >= GROUND) {
          s.by   = GROUND - BALL_R;
          s.bvy  = 0;
          s.px   = VW / 2 - 28;   // reset player beside ball
          s.phase = 'playing';
        }
        return;
      }

      // Kick-timer decay (squash-stretch)
      if (s.kickTimer > 0) s.kickTimer--;

      // Ball physics
      s.bvy += GRAVITY;
      s.bvx *= FRICTION;

      // Motion trail when moving fast
      const spd = Math.hypot(s.bvx, s.bvy);
      if (spd > 2.5) {
        s.trail.unshift({ x: s.bx, y: s.by });
        if (s.trail.length > 4) s.trail.pop();
      } else if (s.trail.length) {
        s.trail.pop();
      }

      s.bx  += s.bvx;
      s.by  += s.bvy;
      s.brot += s.bvx * 0.055;

      // Ground
      if (s.by + BALL_R >= GROUND) {
        s.by = GROUND - BALL_R;
        if (Math.abs(s.bvy) > 1.2) s.bvy *= -GND_DAMP;
        else { s.bvy = 0; s.bvx *= 0.94; }
      }

      // Left wall
      if (s.bx - BALL_R <= 0) {
        s.bx  = BALL_R;
        s.bvx = Math.abs(s.bvx) * WALL_DAMP;
      }

      // Right wall — goal if ball reaches back of net, bounce if it missed
      if (s.bx + BALL_R >= VW) {
        s.bx = VW - BALL_R;
        const inNet = s.by + BALL_R >= GOAL_TOP && s.by - BALL_R <= GROUND;
        if (inNet) {
          s.score++;
          s.phase = 'celebrating'; s.timer = 0;
          s.bvx = 0; s.bvy = 0; s.trail = [];
          setGoalKey(k => k + 1);
          setCelebrating(true);
          return;
        }
        s.bvx = -Math.abs(s.bvx) * WALL_DAMP;
      }

      // Player–ball collision → kick
      const dx   = s.bx - s.px;
      const dy   = s.by - (GROUND - PLAYER_H / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < KICK_DIST && dist > 0) {
        const sign = (GOAL_X - s.bx) >= 0 ? 1 : -1;
        s.bvx = sign * 6 + s.pvx * 0.8;
        s.bvy = -(6.5 + Math.abs(s.pvx) * 0.4);
        s.bx += (dx / dist) * (KICK_DIST - dist + 1);
        s.by += (dy / dist) * (KICK_DIST - dist + 1);
        s.kickTimer = 12;
      }
    };

    // ── Draw ───────────────────────────────────────────────
    const draw = (t: number) => {
      const sc = canvas.width / VW;
      ctx.save();
      ctx.scale(sc, sc);
      const s = gs.current;

      // ── Time-of-day sky ──────────────────────────────────
      const now  = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;

      // Key stops: [hour, [topR,topG,topB], [botR,botG,botB]]
      type Stop = [number, number[], number[]];
      const stops: Stop[] = [
        [0,    [10,10,36],     [22,44,90]   ],  // midnight
        [5,    [10,10,36],     [22,44,90]   ],  // pre-dawn
        [6,    [180,70,30],    [255,130,60] ],  // sunrise
        [8,    [60,140,210],   [130,190,240]],  // morning
        [12,   [25,120,240],   [90,170,255] ],  // noon
        [17,   [40,130,220],   [110,175,245]],  // afternoon
        [19,   [210,90,30],    [255,150,50] ],  // sunset
        [21,   [60,20,70],     [30,15,70]   ],  // dusk
        [24,   [10,10,36],     [22,44,90]   ],  // midnight (wrap)
      ];
      const lerp3 = (a: number[], b: number[], f: number) =>
        a.map((v, i) => Math.round(v + (b[i] - v) * f));
      let si = 0;
      for (let i = 0; i < stops.length - 1; i++) if (hour >= stops[i][0]) si = i;
      const [h0, t0, b0] = stops[si];
      const [h1, t1, b1] = stops[si + 1];
      const f   = Math.min(1, (hour - h0) / (h1 - h0));
      const top = lerp3(t0, t1, f);
      const bot = lerp3(b0, b1, f);

      const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
      sky.addColorStop(0, `rgb(${top})`);
      sky.addColorStop(1, `rgb(${bot})`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, VW, GROUND);

      // Stars (only at night / dusk)
      const starAlpha = hour < 6 ? 0.8 : hour < 7 ? (7 - hour) * 0.8 : hour > 20 ? (hour - 20) * 0.4 : 0;
      if (starAlpha > 0) {
        const stars = [[42,12],[130,7],[258,20],[392,9],[510,16],[618,7],[158,33],[312,38],[462,28],[55,42],[700,18]];
        ctx.fillStyle = `rgba(255,255,255,${starAlpha})`;
        stars.forEach(([sx, sy]) => ctx.fillRect(sx, sy, 1.8, 1.8));
      }

      // Sun or moon
      const isNight = hour < 5.5 || hour > 21;
      const isDawn  = hour >= 5.5 && hour < 7;
      const isDusk  = hour >= 19 && hour <= 21;

      if (isNight || isDawn || isDusk) {
        // Moon (crescent) — position drifts across sky
        const moonX = isDawn ? 80 : isDusk ? VW - 80 : VW - 58;
        ctx.fillStyle = 'rgba(255,255,230,0.92)';
        ctx.beginPath(); ctx.arc(moonX, 32, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgb(${top})`;
        ctx.beginPath(); ctx.arc(moonX + 7, 29, 16, 0, Math.PI * 2); ctx.fill();
      } else {
        // Sun — arcs from left (sunrise) to right (sunset)
        const sunProgress = (hour - 6) / 12; // 0 at 6am, 1 at 6pm
        const sunX = VW * 0.1 + sunProgress * VW * 0.8;
        const sunY = GROUND * 0.75 - Math.sin(sunProgress * Math.PI) * GROUND * 0.6;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 40);
        sunGlow.addColorStop(0,   'rgba(255,240,100,0.9)');
        sunGlow.addColorStop(0.3, 'rgba(255,200,50,0.4)');
        sunGlow.addColorStop(1,   'rgba(255,200,50,0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath(); ctx.arc(sunX, sunY, 40, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffe866';
        ctx.beginPath(); ctx.arc(sunX, sunY, 14, 0, Math.PI * 2); ctx.fill();
      }

      // ── Bleachers (drawn before crowd so fans sit on them) ─
      const standsGrad = ctx.createLinearGradient(0, STANDS_TOP, 0, GROUND);
      standsGrad.addColorStop(0, '#22222e');
      standsGrad.addColorStop(1, '#16161f');
      ctx.fillStyle = standsGrad;
      ctx.fillRect(0, STANDS_TOP, VW, STANDS_H);
      // Subtle tier lines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.8;
      for (let i = 1; i < 4; i++) {
        const ty = STANDS_TOP + (i / 4) * STANDS_H;
        ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(VW, ty); ctx.stroke();
      }

      // ── Crowd (sitting in the stands) ───────────────────
      const cel = s.phase === 'celebrating';
      const bSpd = cel ? 7 : 1.4;
      const bAmp = cel ? 6 : 2;
      s.crowd.forEach(({ x, y, ph, hue, sz }) => {
        const bob = Math.sin(t * 0.003 * bSpd + ph) * bAmp;
        // Body
        ctx.fillStyle = `hsl(${hue},65%,55%)`;
        ctx.fillRect(x - sz * 0.5, y + bob, sz, sz * 1.1);
        // Head
        ctx.fillStyle = '#dba882';
        ctx.beginPath();
        ctx.arc(x, y + bob - sz * 0.75, sz * 0.58, 0, Math.PI * 2);
        ctx.fill();
        // Arms up during celebration
        if (cel) {
          ctx.strokeStyle = `hsl(${hue},65%,55%)`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x - sz * 0.5, y + bob + sz * 0.2);
          ctx.lineTo(x - sz * 1.1, y + bob - sz * 0.6);
          ctx.moveTo(x + sz * 0.5, y + bob + sz * 0.2);
          ctx.lineTo(x + sz * 1.1, y + bob - sz * 0.6);
          ctx.stroke();
        }
      });


      // ── Instructions pill (in sky) ───────────────────────
      const iW = 318, iH = 22, iY = 50;
      const iX = VW / 2 - iW / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeStyle = 'rgba(52,211,153,0.3)';
      ctx.lineWidth = 1;
      pillRect(ctx, iX, iY, iW, iH);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(52,211,153,0.75)';
      ctx.font = '11px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('← → to move  •  run into ball to kick', VW / 2, iY + 15);
      ctx.textAlign = 'left';

      // ── Field ────────────────────────────────────────────
      const fg = ctx.createLinearGradient(0, GROUND, 0, VH);
      fg.addColorStop(0, '#2e7d32');
      fg.addColorStop(1, '#1b5e20');
      ctx.fillStyle = fg;
      ctx.fillRect(0, GROUND, VW, VH - GROUND);

      // Stripes
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.04)';
        ctx.fillRect(i * (VW / 8), GROUND, VW / 8, VH - GROUND);
      }


      // ── Goal — side-profile view ─────────────────────────
      // Corners:  front-top, back-top, back-bottom, front-bottom
      const ftx = GOAL_X,              fty = GOAL_TOP;
      const btx = GOAL_X + GOAL_DEPTH, bty = GOAL_TOP + GOAL_SLOPE;
      const bbx = GOAL_X + GOAL_DEPTH, bby = GROUND;
      const fbx = GOAL_X,              fby = GROUND;

      // Net fill (clipped to side-profile quadrilateral)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ftx, fty); ctx.lineTo(btx, bty);
      ctx.lineTo(bbx, bby); ctx.lineTo(fbx, fby);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fill();
      ctx.clip();

      // Net grid clipped inside quad
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 0.6;
      // Vertical lines
      for (let nx = GOAL_X; nx <= GOAL_X + GOAL_DEPTH; nx += 9) {
        ctx.beginPath(); ctx.moveTo(nx, GOAL_TOP - 4); ctx.lineTo(nx, GROUND); ctx.stroke();
      }
      // Horizontal lines
      for (let ny = GOAL_TOP; ny <= GROUND; ny += 9) {
        ctx.beginPath(); ctx.moveTo(GOAL_X, ny); ctx.lineTo(GOAL_X + GOAL_DEPTH, ny); ctx.stroke();
      }
      ctx.restore();

      // Back corner post (dimmer — further away)
      ctx.strokeStyle = 'rgba(180,180,180,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(btx, bty); ctx.lineTo(bbx, bby); ctx.stroke();

      // Front post (bright + neon glow)
      ctx.shadowColor = 'rgba(255,255,255,1)';
      ctx.shadowBlur  = 20;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ftx, fby); ctx.lineTo(ftx, fty); ctx.stroke();

      // Top bar (front-top → back-top, slight slope)
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(ftx, fty); ctx.lineTo(btx, bty); ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Player (chibi cartoon style) ────────────────────
      const px     = s.px;
      const moving = s.pvx !== 0;
      const lp     = t * 0.04;
      const facing = s.pvx < 0 ? -1 : 1;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(px, GROUND + 3, 15, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Shoes ───────────────────────────────────────────
      ctx.fillStyle = '#ffb6c1';
      if (moving) {
        const l1 = Math.sin(lp) * 10;
        const l2 = Math.sin(lp + Math.PI) * 10;
        ctx.save(); ctx.translate(px - 5, GROUND);
        ctx.rotate(l1 * 0.05);
        ctx.beginPath(); ctx.ellipse(facing * 1, -2, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.save(); ctx.translate(px + 5, GROUND);
        ctx.rotate(l2 * 0.05);
        ctx.beginPath(); ctx.ellipse(facing * 1, -2, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath(); ctx.ellipse(px - 6, GROUND - 2, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(px + 6, GROUND - 2, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      }

      // ── Legs (shorts) ────────────────────────────────────
      ctx.fillStyle = '#000000';
      if (moving) {
        const l1 = Math.sin(lp) * 10;
        const l2 = Math.sin(lp + Math.PI) * 10;
        ctx.save(); ctx.translate(px - 5, GROUND - 16); ctx.rotate(l1 * 0.05);
        ctx.fillRect(-4, 0, 8, 14); ctx.restore();
        ctx.save(); ctx.translate(px + 5, GROUND - 16); ctx.rotate(l2 * 0.05);
        ctx.fillRect(-4, 0, 8, 14); ctx.restore();
      } else {
        ctx.fillRect(px - 9, GROUND - 16, 8, 14);
        ctx.fillRect(px + 1, GROUND - 16, 8, 14);
      }

      // ── Arms ─────────────────────────────────────────────
      const armY = GROUND - PLAYER_H + 6;
      ctx.fillStyle = '#f5cba7';
      if (moving) {
        const a1 = Math.sin(lp + Math.PI) * 0.45;
        const a2 = Math.sin(lp) * 0.45;
        ctx.save(); ctx.translate(px - 11, armY); ctx.rotate(a1);
        ctx.beginPath(); ctx.ellipse(0, 6, 3.5, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(px + 11, armY); ctx.rotate(a2);
        ctx.beginPath(); ctx.ellipse(0, 6, 3.5, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } else {
        ctx.beginPath(); ctx.ellipse(px - 12, armY + 6, 3.5, 7, 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(px + 12, armY + 6, 3.5, 7, -0.15, 0, Math.PI * 2); ctx.fill();
      }

      // ── Shirt ─────────────────────────────────────────────
      const bodyTop = GROUND - PLAYER_H + 2;
      const bodyH   = PLAYER_H - 18;
      ctx.fillStyle = '#C70101';
      ctx.beginPath();
      ctx.moveTo(px - 10, bodyTop + 4);
      ctx.arc(px - 6, bodyTop + 4, 4, Math.PI, -Math.PI / 2);
      ctx.arc(px + 6, bodyTop + 4, 4, -Math.PI / 2, 0);
      ctx.lineTo(px + 10, bodyTop + bodyH);
      ctx.arc(px + 7, bodyTop + bodyH, 3, 0, Math.PI / 2);
      ctx.lineTo(px - 7, bodyTop + bodyH + 3);
      ctx.arc(px - 7, bodyTop + bodyH, 3, Math.PI / 2, Math.PI);
      ctx.closePath();
      ctx.fill();
      // Shirt stripe
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(px - 2, bodyTop + 4, 4, bodyH - 1);
      // White collar
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(px, bodyTop + 4, 4, Math.PI, 0); ctx.fill();
      // Number
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 7px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('7', px, bodyTop + bodyH - 3);
      ctx.textAlign = 'left';

      // ── Head ──────────────────────────────────────────────
      const vR  = 14;   // visual head radius (chibi — slightly bigger than HEAD_R constant)
      const hY  = bodyTop - vR + 1;

      // Head base
      ctx.fillStyle = '#f5cba7';
      ctx.beginPath(); ctx.arc(px, hY, vR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 0.8; ctx.stroke();

      // Hair cap (fluffy, three bumps)
      ctx.fillStyle = '#2c1a0e';
      ctx.beginPath();
      ctx.arc(px - vR * 0.55, hY - vR * 0.55, vR * 0.55, -Math.PI, 0.1);
      ctx.arc(px,             hY - vR * 0.88, vR * 0.55, -Math.PI, 0.1);
      ctx.arc(px + vR * 0.55, hY - vR * 0.55, vR * 0.55, -Math.PI, 0.5);
      ctx.arc(px + vR * 0.85, hY - vR * 0.2,  vR * 0.38, -Math.PI * 0.3, 0.8);
      ctx.lineTo(px + vR * 0.6, hY);
      ctx.lineTo(px - vR * 0.6, hY);
      ctx.arc(px - vR * 0.85, hY - vR * 0.2, vR * 0.38, Math.PI - 0.5, Math.PI * 1.3);
      ctx.closePath();
      ctx.fill();

      // Eyes — pupils look in movement direction
      const eo = facing * 1.5;
      const eyeLx = px - 4.5 + eo, eyeRx = px + 4.5 + eo, eyeY2 = hY + 1;
      // Whites
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(eyeLx, eyeY2, 3.5, 4.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(eyeRx, eyeY2, 3.5, 4.2, 0, 0, Math.PI * 2); ctx.fill();
      // Pupils
      ctx.fillStyle = '#1a0a00';
      ctx.beginPath(); ctx.arc(eyeLx + eo * 0.4, eyeY2 + 0.5, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeRx + eo * 0.4, eyeY2 + 0.5, 2.2, 0, Math.PI * 2); ctx.fill();
      // Shine
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(eyeLx + eo * 0.4 + 1, eyeY2 - 0.8, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeRx + eo * 0.4 + 1, eyeY2 - 0.8, 0.8, 0, Math.PI * 2); ctx.fill();


      // Smile (idle) or straight mouth (running)
      ctx.strokeStyle = '#c0785a'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      ctx.beginPath();
      if (moving) {
        ctx.moveTo(px - 3 + eo * 0.3, hY + 7);
        ctx.lineTo(px + 3 + eo * 0.3, hY + 7);
      } else {
        ctx.arc(px, hY + 5, 4, 0.15, Math.PI - 0.15);
      }
      ctx.stroke();

      // ── Ball trail ───────────────────────────────────────
      s.trail.forEach((pt, i) => {
        const a = (1 - (i + 1) / (s.trail.length + 1)) * 0.22;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, BALL_R * (1 - i * 0.18), 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Ball drop shadow ─────────────────────────────────
      const ha    = Math.max(0, GROUND - s.by);
      const ssc   = Math.max(0.1, 1 - ha / 160);
      ctx.fillStyle = `rgba(0,0,0,${0.22 * ssc})`;
      ctx.beginPath();
      ctx.ellipse(s.bx, GROUND + 3, 12 * ssc, 3.5 * ssc, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Ball ─────────────────────────────────────────────
      drawSoccerBall(ctx, s.bx, s.by, s.brot, s.kickTimer);

      // ── Score HUD — arcade retro style ──────────────────
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.strokeStyle = 'rgba(52,211,153,0.7)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(10, 8, 120, 44);
      ctx.strokeRect(10, 8, 120, 44);
      ctx.fillStyle = 'rgba(52,211,153,0.6)';
      ctx.font = '9px "Courier New", monospace';
      ctx.fillText('GOALS', 22, 22);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillText(String(s.score).padStart(2, '0'), 22, 45);

      // ── Vignette ─────────────────────────────────────────
      const vig = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.25, VW / 2, VH / 2, VH);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.42)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, VW, VH);

      // ── CRT scanlines ─────────────────────────────────────
      ctx.fillStyle = 'rgba(0,0,0,0.045)';
      for (let sl = 0; sl < VH; sl += 3) ctx.fillRect(0, sl, VW, 1);

      ctx.restore();
    };

    let alive = true;
    const loop = (t: number) => {
      if (!alive) return;
      update();
      draw(t);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      alive = false;
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener('resize',  resize);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, []);

  return (
    <div className="w-full">
      <div
        ref={wrapRef}
        className="w-full rounded-xl overflow-hidden relative"
        style={{ boxShadow: '0 0 0 1px rgba(52,211,153,0.25), 0 0 32px rgba(52,211,153,0.12), 0 8px 40px rgba(0,0,0,0.4)' }}
      >
        <canvas ref={canvasRef} className="w-full block" />
        {celebrating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '25%' }}>
            <RevealText key={goalKey} text="GOAL!" />
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-[11px] tracking-widest uppercase text-[#001d36]/35 font-beezee">
        ← → arrow keys to play &nbsp;·&nbsp; desktop only, sorry mobile!
      </p>
    </div>
  );
}
