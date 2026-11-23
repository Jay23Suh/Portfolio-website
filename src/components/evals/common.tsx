import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ImageOff } from 'lucide-react';
import FadeIn from '../FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';
import { shapeLabel, shapeUrl, useShapesAvailable } from '../../lib/evals/data';
import { useShowStats } from '../../lib/evals/stats';

export const THESIS = 'hsl(var(--chart-2))';
export const NEWER = 'hsl(var(--chart-1))';
export const groupColor = (g: 'thesis' | 'newer') => (g === 'newer' ? NEWER : THESIS);

// ── Page chrome ───────────────────────────────────────────────────────────────

const TABS = [
  { to: '/evals', label: 'The story', end: true },
  { to: '/evals/results', label: 'The results', end: false },
  { to: '/evals/notebook', label: 'Lab notebook', end: false },
];

/** Sub-navigation for the three layers plus the global "Show the statistics" switch. */
export const EvalsNav: React.FC<{ statsDefault: boolean }> = ({ statsDefault }) => {
  const [stats, setStats] = useShowStats(statsDefault);
  return (
    <nav
      aria-label="Eval explorer"
      className="max-w-5xl mx-auto mb-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white/70 px-3 py-2 font-beezee"
    >
      <div className="flex flex-wrap gap-1">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                isActive ? 'bg-navy text-white' : 'text-[#001d36] hover:bg-muted'
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <span>Show the statistics</span>
        <button
          type="button"
          role="switch"
          aria-checked={stats}
          onClick={() => setStats(!stats)}
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
            stats ? 'bg-navy' : 'bg-gray-300'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              stats ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </label>
    </nav>
  );
};

export const P: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn('text-lg font-beezee leading-relaxed mb-4', className)}>{children}</p>
);

export const Section: React.FC<{ id?: string; title: string; kicker?: string; children: React.ReactNode; wide?: boolean }> = ({
  id,
  title,
  kicker,
  children,
  wide,
}) => (
  <FadeIn delay={0.1}>
    <section id={id} className={cn('mb-14 mx-auto scroll-mt-6', wide ? 'max-w-5xl' : 'max-w-3xl')}>
      {kicker && <div className="text-sm font-semibold tracking-wider uppercase text-navy mb-1">{kicker}</div>}
      <h2 className="text-3xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  </FadeIn>
);

/** Collapsible plain-language explainer under a chart. */
export const WhatAmI: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <details className="group mt-3 rounded-lg border border-border bg-muted/50 px-4 py-2 font-beezee text-sm">
    <summary className="flex cursor-pointer list-none items-center gap-1 font-semibold text-navy">
      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
      What am I looking at?
    </summary>
    <div className="mt-2 space-y-2 text-[#001d36] leading-relaxed">{children}</div>
  </details>
);

export const Takeaway: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-3 border-l-4 border-navy pl-3 text-base font-beezee font-semibold leading-snug">{children}</p>
);

export const ChartCard: React.FC<{ title: string; subtitle?: React.ReactNode; children: React.ReactNode; id?: string }> = ({
  title,
  subtitle,
  children,
  id,
}) => (
  <Card id={id} className="bg-white/80 mb-8 scroll-mt-6">
    <CardHeader className="pb-2">
      <CardTitle className="text-xl">{title}</CardTitle>
      {subtitle && <div className="text-sm font-beezee text-muted-foreground">{subtitle}</div>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export const GroupLegend: React.FC = () => (
  <div className="flex flex-wrap gap-4 text-sm font-beezee text-muted-foreground">
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: THESIS }} /> Thesis models (early 2026)
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: NEWER }} /> Newer models (October 2026)
    </span>
  </div>
);

export const Loading: React.FC<{ error?: string | null }> = ({ error }) => (
  <div className="max-w-3xl mx-auto py-16 text-center font-beezee text-muted-foreground">
    {error ? `Couldn't load the results (${error}).` : 'Loading the results…'}
  </div>
);

// ── Dot-and-whisker chart (SVG; recharts has no horizontal CI plot) ───────────

/** Width of a container in CSS pixels, so SVG charts draw 1 unit = 1px and text keeps its size. */
export function useWidth<T extends HTMLElement>(fallback = 640): [React.RefObject<T>, number] {
  const ref = React.useRef<T>(null);
  const [w, setW] = React.useState(fallback);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(Math.max(280, Math.round(el.getBoundingClientRect().width)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export type DotRow = {
  label: string;
  value: number;
  lo?: number | null;
  hi?: number | null;
  color: string;
  note?: string;
};

export const DotWhisker: React.FC<{
  rows: DotRow[];
  domain: [number, number];
  format: (v: number) => string;
  reference?: { value: number; label: string; lo?: number | null; hi?: number | null };
  showCI: boolean;
  ariaLabel: string;
  ticks?: number[];
}> = ({ rows, domain, format, reference, showCI, ariaLabel, ticks }) => {
  const [ref, W] = useWidth<HTMLDivElement>();
  const narrow = W < 460;
  const labelW = narrow ? 112 : 138;
  const fs = narrow ? 11 : 13;
  const rowH = narrow ? 26 : 30;
  const top = reference ? 26 : 8;
  const H = top + rows.length * rowH + 26;
  const plotW = W - labelW - (narrow ? 44 : 56);
  const x = (v: number) => labelW + ((v - domain[0]) / (domain[1] - domain[0])) * plotW;
  const tickVals =
    ticks ?? Array.from({ length: 5 }, (_, i) => domain[0] + ((domain[1] - domain[0]) * i) / 4);
  return (
    <div ref={ref} className="w-full">
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="max-w-full h-auto font-beezee" role="img" aria-label={ariaLabel}>
      {tickVals.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={top - 4} y2={H - 22} stroke="hsl(var(--border))" />
          <text x={x(t)} y={H - 6} textAnchor="middle" fontSize={12} fill="hsl(var(--muted-foreground))">
            {format(t)}
          </text>
        </g>
      ))}
      {reference && (
        <g>
          {showCI && reference.lo != null && reference.hi != null && (
            <rect
              x={x(reference.lo)}
              width={x(reference.hi) - x(reference.lo)}
              y={top - 4}
              height={H - 18 - top}
              fill="hsl(var(--foreground))"
              opacity={0.07}
            />
          )}
          <line
            x1={x(reference.value)}
            x2={x(reference.value)}
            y1={top - 4}
            y2={H - 22}
            stroke="hsl(var(--foreground))"
            strokeDasharray="4 4"
          />
          <text x={x(reference.value)} y={14} textAnchor="middle" fontSize={12} fill="hsl(var(--foreground))">
            {reference.label}
          </text>
        </g>
      )}
      {rows.map((r, i) => {
        const cy = top + i * rowH + rowH / 2;
        const hasCI = showCI && r.lo != null && r.hi != null;
        return (
          <g key={r.label + i}>
            <text x={labelW - 8} y={cy + 4} textAnchor="end" fontSize={fs} fill="#001d36">
              {r.label}
            </text>
            {hasCI && <line x1={x(r.lo as number)} x2={x(r.hi as number)} y1={cy} y2={cy} stroke={r.color} strokeWidth={2.5} />}
            {hasCI && (
              <>
                <line x1={x(r.lo as number)} x2={x(r.lo as number)} y1={cy - 5} y2={cy + 5} stroke={r.color} strokeWidth={2} />
                <line x1={x(r.hi as number)} x2={x(r.hi as number)} y1={cy - 5} y2={cy + 5} stroke={r.color} strokeWidth={2} />
              </>
            )}
            <circle cx={x(r.value)} cy={cy} r={6} fill={r.color} stroke="white" strokeWidth={1.5}>
              <title>
                {r.label}: {format(r.value)}
                {r.lo != null && r.hi != null ? ` (95% CI ${format(r.lo)}–${format(r.hi)})` : ''}
                {r.note ? ` · ${r.note}` : ''}
              </title>
            </circle>
            <text x={Math.min(x(hasCI ? (r.hi as number) : r.value) + 10, W - 4)} y={cy + 4} fontSize={fs - 1} fill="#001d36">
              {format(r.value)}
            </text>
          </g>
        );
      })}
    </svg>
    </div>
  );
};

// ── Shape tile: the image when available, otherwise a placeholder card ─────────

export const ShapeTile: React.FC<{
  id: string;
  caption?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'lg';
}> = ({ id, caption, selected, onClick, size = 'lg' }) => {
  const available = useShapesAvailable();
  const box = size === 'lg' ? 'h-36 sm:h-44' : 'h-24';
  const inner = available ? (
    <img src={shapeUrl(id)} alt={`Silhouette: ${shapeLabel(id)}`} className={cn(box, 'w-full object-contain')} />
  ) : (
    <div className={cn(box, 'w-full flex flex-col items-center justify-center gap-1 text-muted-foreground')}>
      <ImageOff className="h-6 w-6" aria-hidden />
      <span className="text-xs font-beezee text-center px-2">Shape images coming soon</span>
      <span className="text-[11px] font-beezee text-center px-2">{shapeLabel(id)}</span>
    </div>
  );
  const cls = cn(
    'rounded-xl border-2 bg-white p-2 w-full text-left transition-colors',
    selected ? 'border-navy ring-2 ring-navy/30' : 'border-border',
    onClick && 'hover:border-navy'
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={cls} aria-pressed={selected}>
      {inner}
      {caption && <div className="mt-1 text-center text-sm font-beezee">{caption}</div>}
    </button>
  ) : (
    <div className={cls}>
      {inner}
      {caption && <div className="mt-1 text-center text-sm font-beezee">{caption}</div>}
    </div>
  );
};
