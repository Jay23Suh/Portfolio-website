import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

export interface Track {
  title: string;
  artist: string;
  cover: string;
  src: string;
}
export type LoopMode = 'off' | 'all' | 'one';
export type Direction = 'next' | 'prev' | null;
type AudioCtor = typeof AudioContext;

function useRafLoop(cb: (now: number, dt: number) => void) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      cbRef.current(now, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

function useTransitionSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    return () => { ctxRef.current?.close().catch(() => {}); ctxRef.current = null; };
  }, []);
  return useCallback((bassEnergy = 0.5) => {
    try {
      if (!ctxRef.current) {
        const Ctor: AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext;
        if (!Ctor) return;
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startFreq = 440 + bassEnergy * 440;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * (2 / 3), now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.18);
    } catch { /* unavailable */ }
  }, []);
}

const FFT_SIZE = 256;
function useAudioAnalyser(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array>(new Uint8Array(FFT_SIZE / 2));
  const connectedRef = useRef(false);

  const connect = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || connectedRef.current) return;
    try {
      const Ctor: AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.8;
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx; analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      connectedRef.current = true;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    } catch { /* unavailable or CORS */ }
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener('play', connect, { once: true });
    return () => audio.removeEventListener('play', connect);
  }, [audioRef, connect]);

  useEffect(() => () => { ctxRef.current?.close().catch(() => {}); }, []);

  const getFrequencyData = useCallback((): Uint8Array | null => {
    if (!analyserRef.current) return null;
    if (ctxRef.current?.state === 'suspended') ctxRef.current.resume().catch(() => {});
    analyserRef.current.getByteFrequencyData(dataRef.current);
    return dataRef.current;
  }, []);

  const getBandEnergy = useCallback((startBin: number, endBin: number): number => {
    if (!analyserRef.current) return 0;
    const data = dataRef.current;
    const count = endBin - startBin;
    if (count <= 0) return 0;
    let sum = 0;
    for (let i = startBin; i < endBin && i < data.length; i++) sum += data[i];
    return sum / count / 255;
  }, []);

  return { getFrequencyData, getBandEnergy };
}

interface State {
  currentIndex: number;
  order: number[];
  loopMode: LoopMode;
  isPlaying: boolean;
  direction: Direction;
}
type Action =
  | { type: 'PLAY' } | { type: 'PAUSE' }
  | { type: 'SET_TRACK'; index: number; direction: Direction }
  | { type: 'CYCLE_LOOP' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'PLAY': return { ...state, isPlaying: true };
    case 'PAUSE': return { ...state, isPlaying: false };
    case 'SET_TRACK': return { ...state, currentIndex: action.index, direction: action.direction };
    case 'CYCLE_LOOP': {
      const next: LoopMode = state.loopMode === 'off' ? 'one' : 'off';
      return { ...state, loopMode: next };
    }
    default: return state;
  }
}

function useAudioPlayer(tracks: Track[]) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [state, dispatch] = useReducer(reducer, {
    currentIndex: 0,
    order: tracks.map((_, i) => i),
    loopMode: 'off',
    isPlaying: false,
    direction: null,
  });
  const { getFrequencyData, getBandEnergy } = useAudioAnalyser(audioRef);
  const playTransitionSound = useTransitionSound();

  const loadTrack = useCallback((index: number, autoplay: boolean, direction: Direction) => {
    const audio = audioRef.current;
    if (!audio) return;
    playTransitionSound(getBandEnergy(0, 4));
    dispatch({ type: 'SET_TRACK', index, direction });
    audio.src = tracks[index].src;
    audio.load();
    if (autoplay) audio.play().catch(() => {});
  }, [tracks, playTransitionSound, getBandEnergy]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
  }, []);

  const cycleLoop = useCallback(() => dispatch({ type: 'CYCLE_LOOP' }), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => dispatch({ type: 'PLAY' });
    const onPause = () => dispatch({ type: 'PAUSE' });
    const onLoaded = () => setDuration(audio.duration);
    const onTime = () => { setCurrentTime(audio.currentTime); if (audio.duration) setDuration(audio.duration); };
    const onEnded = () => {
      if (state.loopMode === 'one') { audio.currentTime = 0; audio.play().catch(() => {}); }
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [state.loopMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[0].src;
    audio.load();
  }, [tracks]);

  return { audioRef, state, currentTime, duration, currentTrack: tracks[state.currentIndex], toggle, seek, cycleLoop, getFrequencyData, loadTrack };
}

/* ScalesMixer */
const COLS = 10, ROWS = 10;
const BAND_RANGES: [number, number][] = [[0,1],[1,3],[3,6],[6,10],[10,16],[16,24],[24,36],[36,52],[52,74],[74,100]];
const sineInOut = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const sineOut = (x: number) => Math.sin((x * Math.PI) / 2);
const sineIn = (x: number) => 1 - Math.cos((x * Math.PI) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function ScalesMixer({ isPlaying, getFrequencyData }: { isPlaying: boolean; getFrequencyData?: () => Uint8Array | null }) {
  const maskId = useId().replace(/:/g, '_');
  const colRefs = useRef<(SVGGElement | null)[]>([]);
  const circleRefs = useRef<(SVGCircleElement | null)[][]>(Array.from({ length: COLS }, () => []));
  const tRef = useRef(50);

  useRafLoop((_, dt) => {
    if (isPlaying) tRef.current += dt / 1000;
    const time = tRef.current;
    const freqData = getFrequencyData?.();
    for (let c = 0; c < COLS; c++) {
      let energy = 1.0;
      if (freqData) {
        const [s, e] = BAND_RANGES[c];
        let sum = 0;
        for (let b = s; b < e; b++) sum += freqData[b] ?? 0;
        energy = Math.sqrt(sum / (e - s) / 255);
      }
      const colEl = colRefs.current[c];
      if (colEl) {
        const local = time - c * (3 / (COLS - 1));
        const cyc = ((local % 3) + 3) % 3;
        const ay = 11 * sineInOut(cyc < 1.5 ? cyc / 1.5 : 1 - (cyc - 1.5) / 1.5) * (freqData ? 0.4 + energy : 1);
        colEl.style.transform = `translate(${c * 10}px, ${ay}px)`;
      }
      for (let r = 0; r < ROWS; r++) {
        const circle = circleRefs.current[c][r];
        if (!circle) continue;
        const frac = r / ROWS;
        const yFrom = lerp(77, -77, frac);
        const yTo = lerp(c, -c, frac);
        const local2 = time - c / COLS;
        const cyc2 = ((local2 % 2) + 2) % 2;
        const e2 = cyc2 < 1 ? sineOut(cyc2) : sineIn(1 - (cyc2 - 1));
        const ty = lerp(yFrom, yTo, e2);
        const s2 = lerp(0.133, 0.8, e2) * (freqData ? 0.5 + energy : 1);
        circle.style.transform = `translateY(${ty}px) scale(${s2})`;
      }
    }
  });

  return (
    <svg className="mp-scales" viewBox="0 0 98 108" aria-hidden="true">
      <mask id={maskId}><rect width="10" height="10" fill="#fff" /></mask>
      {Array.from({ length: COLS }, (_, c) => (
        <g key={c} ref={el => { colRefs.current[c] = el; }} style={{ transform: `translate(${c * 10}px, 0px)` }}>
          {Array.from({ length: ROWS }, (_, r) => (
            <g key={r} mask={`url(#${maskId})`} transform={`translate(0 ${r * 10})`}>
              <circle ref={el => { circleRefs.current[c][r] = el; }} cx="5" cy="5" r="5" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

/* Disc */
interface Layer { id: number; track: Track; dir: Direction; }

function Disc({ layers, isPlaying, trackKey, direction, onZoomToggle }: {
  layers: Layer[]; isPlaying: boolean; trackKey: number; direction: Direction; onZoomToggle: () => void;
}) {
  const spinRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef(0);
  const velRef = useRef(0);
  const burstRef = useRef({ from: 0, start: 0, active: false, pending: false });
  const lastKey = useRef(trackKey);

  useEffect(() => {
    if (trackKey !== lastKey.current) {
      lastKey.current = trackKey;
      if (direction) { burstRef.current.from = direction === 'prev' ? 360 : -360; burstRef.current.pending = true; }
    }
  }, [trackKey, direction]);

  useRafLoop((now) => {
    const el = spinRef.current;
    if (!el) return;
    if (isPlaying) velRef.current += (0.4375 - velRef.current) * 0.2;
    else { velRef.current *= 0.96; if (velRef.current < 0.001) velRef.current = 0; }
    rotRef.current += velRef.current;
    const burst = burstRef.current;
    if (burst.pending) { burst.start = now; burst.pending = false; burst.active = true; }
    let b = 0;
    if (burst.active) {
      const t = (now - burst.start) / 620;
      if (t >= 1) burst.active = false;
      else b = burst.from * (1 - Math.pow(1 - t, 3));
    }
    el.style.transform = `scale(1.01) rotate(${rotRef.current + b}deg)`;
  });

  return (
    <div className="mp-mask" onClick={e => { e.stopPropagation(); onZoomToggle(); }}>
      <div className="mp-spin" ref={spinRef}>
        {layers.map((l, i) => {
          const isNewest = i === layers.length - 1;
          return <img key={l.id} src={l.track.cover} alt="" className={`mp-cover${isNewest ? (l.dir ? ' mp-cover-enter' : '') : ' mp-cover-exit'}`} draggable={false} />;
        })}
      </div>
      <div className="mp-hole"><div className="mp-hole-inner" /></div>
    </div>
  );
}

/* TrackInfo */
function TrackInfo({ layers }: { layers: Layer[] }) {
  return (
    <div className="mp-track-info">
      {layers.map((l, i) => {
        const isNewest = i === layers.length - 1;
        const dx = l.dir === 'next' ? 14 : l.dir === 'prev' ? -14 : 0;
        const state = isNewest ? (l.dir ? 'mp-ti-enter' : '') : 'mp-ti-exit';
        const style = { ['--dx' as string]: `${isNewest ? dx : -dx}px` } as React.CSSProperties;
        return (
          <div key={l.id} className={`mp-ti-layer${isNewest ? '' : ' mp-ti-abs'}`}>
            <p className={`mp-artist ${state}`} style={style}>{l.track.artist}</p>
            <p className={`mp-title ${state}`} style={style}>{l.track.title}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ProgressBar */
function fmt(s: number) {
  if (!isFinite(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function ProgressBar({ currentTime, duration, onSeek }: { currentTime: number; duration: number; onSeek: (pct: number) => void; }) {
  const pct = duration ? (currentTime / duration) * 100 : 0;
  return (
    <>
      <div className="mp-bar" onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        onSeek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
      }}>
        <div className="mp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="mp-time">
        <span>{fmt(currentTime)}</span>
        <span className="mp-sep">/</span>
        <span>{fmt(duration)}</span>
      </div>
    </>
  );
}

/* MusicPlayer */
export interface MusicPlayerProps {
  tracks: Track[];
  crossOrigin?: 'anonymous' | 'use-credentials';
  /** When changed, immediately loads and plays that track index */
  controlledIndex?: number;
  onClose?: () => void;
}

export function MusicPlayer({ tracks, crossOrigin, controlledIndex, onClose }: MusicPlayerProps) {
  const player = useAudioPlayer(tracks);
  const [layers, setLayers] = useState<Layer[]>(() => [{ id: 0, track: tracks[0], dir: null }]);
  const lastIndex = useRef(0);
  const idRef = useRef(1);
  const prevControlled = useRef<number | undefined>(undefined);

  // Switch track when controlledIndex changes from outside
  useEffect(() => {
    if (controlledIndex === undefined) return;
    if (controlledIndex === prevControlled.current) return;
    prevControlled.current = controlledIndex;
    player.loadTrack(controlledIndex, true, null);
  }, [controlledIndex, player.loadTrack]);

  useEffect(() => {
    if (player.state.currentIndex === lastIndex.current) return;
    lastIndex.current = player.state.currentIndex;
    const id = idRef.current++;
    setLayers(prev => [...prev, { id, track: player.currentTrack, dir: player.state.direction }]);
    const t = setTimeout(() => setLayers(prev => prev.filter(l => l.id === id)), 760);
    return () => clearTimeout(t);
  }, [player.state.currentIndex, player.currentTrack, player.state.direction]);

  const shortcuts = useMemo(() => ({
    toggle: player.toggle,
    seekForward: () => { const a = player.audioRef.current; if (a) a.currentTime = Math.min(a.duration || 0, a.currentTime + 5); },
    seekBackward: () => { const a = player.audioRef.current; if (a) a.currentTime = Math.max(0, a.currentTime - 5); },
    cycleLoop: player.cycleLoop,
  }), [player.toggle, player.cycleLoop, player.audioRef]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === ' ') { e.preventDefault(); shortcuts.toggle(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); shortcuts.seekForward(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); shortcuts.seekBackward(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcuts]);

  return (
    <div className={`mp-card${player.state.isPlaying ? ' mp-playing' : ''}`}>
      <audio ref={player.audioRef} preload="metadata" crossOrigin={crossOrigin} />
      <Disc
        layers={layers}
        isPlaying={player.state.isPlaying}
        trackKey={player.state.currentIndex}
        direction={player.state.direction}
        onZoomToggle={player.toggle}
      />
      <div className="mp-info">
        <ScalesMixer isPlaying={player.state.isPlaying} getFrequencyData={player.getFrequencyData} />
        <TrackInfo layers={layers} />
        <ProgressBar currentTime={player.currentTime} duration={player.duration} onSeek={player.seek} />
        <div className="mp-controls">
          <button className="mp-ctrl mp-ctrl-play" onClick={player.toggle} aria-label={player.state.isPlaying ? 'Pause' : 'Play'}>
            {player.state.isPlaying
              ? <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 5h3v14H6zM15 5h3v14h-3z" /></svg>
              : <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 5v14l11-7z" /></svg>
            }
          </button>
          <button className={`mp-ctrl mp-ctrl-loop${player.state.loopMode !== 'off' ? ' mp-active' : ''}`} onClick={player.cycleLoop} aria-label="Loop">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12V8a2 2 0 0 1 2-2h12" /><path d="M16 3l4 3l-4 3" />
              <path d="M20 12v4a2 2 0 0 1-2 2H6" /><path d="M8 21l-4-3l4-3" />
            </svg>
          </button>
          {onClose && (
            <button className="mp-ctrl mp-ctrl-close" onClick={onClose} aria-label="Close" style={{ marginLeft: 'auto' }}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
