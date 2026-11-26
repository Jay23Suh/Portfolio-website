import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, ImageOff } from 'lucide-react';
import FadeIn from '../FadeIn';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';
import { shapeLabel, shapeUrl, useShapesAvailable } from '../../lib/evals/data';
import { useShowStats } from '../../lib/evals/stats';

export const THESIS = 'hsl(var(--chart-2))';
export const NEWER = 'hsl(var(--chart-1))';
export const groupColor = (g: 'thesis' | 'newer') => (g === 'newer' ? NEWER : THESIS);

// ── Page chrome ───────────────────────────────────────────────────────────────

type NavTab = { to: string; label: string; end: boolean };

const TABS: NavTab[] = [
  { to: '/evals', label: 'The story', end: true },
  { to: '/evals/results', label: 'The results', end: false },
  { to: '/evals/notebook', label: 'Lab notebook', end: false },
];

/** Story and results tabs for an eval that lives under `base` (e.g. /evals/proofs). */
export const evalTabs = (base: string): NavTab[] => [
  { to: base, label: 'The story', end: true },
  { to: `${base}/results`, label: 'The results', end: false },
];

/** Sub-navigation for the layers plus the global "Show the statistics" switch. */
export const EvalsNav: React.FC<{ statsDefault: boolean; tabs?: NavTab[] }> = ({ statsDefault, tabs = TABS }) => {
  const [stats, setStats] = useShowStats(statsDefault);
  return (
    <nav
      aria-label="Eval explorer"
      className="max-w-5xl mx-auto mb-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white/70 px-3 py-2 font-beezee"
    >
      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => (
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

export type EvalKey = 'shapes' | 'proofs' | 'gambles' | 'choices';
const EVALS: { key: EvalKey; label: string; story: string; results: string }[] = [
  { key: 'shapes', label: 'Shapes', story: '/evals', results: '/evals/results' },
  { key: 'proofs', label: 'Proofs', story: '/evals/proofs', results: '/evals/proofs/results' },
  { key: 'gambles', label: 'Gambles', story: '/evals/gambles', results: '/evals/gambles/results' },
  { key: 'choices', label: 'Choices', story: '/evals/choices', results: '/evals/choices/results' },
];

/** Start a page at the top: the app has no scroll restoration, and the story buttons sit at the bottom. */
export function useScrollTop() {
  React.useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);
}

/** Small cross-links to the other evals: "More evals: Proofs · Gambles". */
export const MoreEvals: React.FC<{ current: EvalKey; view: 'story' | 'results'; className?: string }> = ({ current, view, className }) => (
  <nav aria-label="More evals" className={cn('max-w-5xl mx-auto font-beezee text-sm text-muted-foreground', className)}>
    More evals:{' '}
    {EVALS.filter((e) => e.key !== current).map((e, i) => (
      <React.Fragment key={e.key}>
        {i > 0 && <span aria-hidden> · </span>}
        <Link to={e[view]} className="text-navy underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
          {e.label}
        </Link>
      </React.Fragment>
    ))}
  </nav>
);

/** Page title block, the same look as the shape story's hero. */
export const EvalHero: React.FC<{ badge: string; title: string; children: React.ReactNode }> = ({ badge, title, children }) => (
  <FadeIn>
    <section className="mb-10 text-center max-w-4xl mx-auto">
      <Badge variant="secondary" className="mb-4 font-beezee">
        {badge}
      </Badge>
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">{title}</h1>
      <p className="text-xl sm:text-2xl text-gray-700">{children}</p>
    </section>
  </FadeIn>
);

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
export function useWidth<T extends HTMLElement>(fallback = 640, min = 280): [React.RefObject<T>, number] {
  const ref = React.useRef<T>(null);
  const [w, setW] = React.useState(fallback);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(Math.max(min, Math.round(el.getBoundingClientRect().width)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [min]);
  return [ref, w];
}

export type DotRow = {
  label: string;
  value: number;
  lo?: number | null;
  hi?: number | null;
  color: string;
  note?: string;
  /** Dumbbell: a hollow marker at `from`, joined to the filled marker at `value`. */
  from?: number | null;
  /** Interval around the hollow `from` marker. */
  fromLo?: number | null;
  fromHi?: number | null;
  /** 'diamond' marks rules and baselines by shape, not only colour. */
  marker?: 'dot' | 'diamond';
  /** Italic, muted label. */
  baseline?: boolean;
  /** Extra space and a dotted divider above this row. */
  gapBefore?: boolean;
  /** Appends "†" to the label (a settings note applies). */
  dagger?: boolean;
};

export type DotReference = {
  value: number;
  label: string;
  labelNarrow?: string;
  lo?: number | null;
  hi?: number | null;
  /** Always-on shaded range from lo to hi (not a CI), with no dashed line. */
  band?: boolean;
  /** Hatched region from `value` to the end of the axis ("out of reach"). */
  shadeBeyond?: boolean;
  /** Label line: 0 (top) or 1 (below it), so neighbouring labels don't collide. */
  row?: 0 | 1;
  anchor?: 'start' | 'middle' | 'end';
};

const ROW_GAP = 10;

const Diamond: React.FC<{ cx: number; cy: number; r: number; fill: string; stroke: string; strokeWidth: number; children?: React.ReactNode }> = ({
  cx,
  cy,
  r,
  fill,
  stroke,
  strokeWidth,
  children,
}) => (
  <path d={`M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`} fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
    {children}
  </path>
);

export const DotWhisker: React.FC<{
  rows: DotRow[];
  domain: [number, number];
  format: (v: number) => string;
  reference?: DotReference;
  references?: DotReference[];
  showCI: boolean;
  ariaLabel: string;
  ticks?: number[];
  describedBy?: string;
}> = ({ rows, domain, format, reference, references, showCI, ariaLabel, ticks, describedBy }) => {
  const [ref, W] = useWidth<HTMLDivElement>();
  const hatchId = `hatch${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const refs = references ?? (reference ? [reference] : []);
  const halo = refs.some((r) => r.band || r.shadeBeyond);
  const narrow = W < 460;
  const labelW = narrow ? 112 : 138;
  const fs = narrow ? 11 : 13;
  const rowH = narrow ? 26 : 30;
  const labelRows = refs.length ? Math.max(...refs.map((r) => r.row ?? 0)) + 1 : 0;
  const top = refs.length ? 26 + 18 * (labelRows - 1) : 8;
  const gapsUpTo = (i: number) => rows.slice(0, i + 1).filter((r) => r.gapBefore).length;
  const H = top + rows.length * rowH + gapsUpTo(rows.length - 1) * ROW_GAP + 26;
  const plotW = W - labelW - (narrow ? 44 : 56);
  const x = (v: number) => labelW + ((v - domain[0]) / (domain[1] - domain[0])) * plotW;
  const tickVals =
    ticks ?? Array.from({ length: 5 }, (_, i) => domain[0] + ((domain[1] - domain[0]) * i) / 4);
  const refLabelX = (r: DotReference) => {
    const v = r.band && r.lo != null && r.hi != null ? (r.lo + r.hi) / 2 : r.value;
    const a = r.anchor ?? 'middle';
    return x(v) + (a === 'end' ? -4 : a === 'start' ? 4 : 0);
  };
  return (
    <div ref={ref} className="w-full">
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className="max-w-full h-auto font-beezee"
      role="img"
      aria-label={ariaLabel}
      aria-describedby={describedBy}
    >
      {refs.some((r) => r.shadeBeyond) && (
        <defs>
          <pattern id={hatchId} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={6} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} opacity={0.35} />
          </pattern>
        </defs>
      )}
      {tickVals.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={top - 4} y2={H - 22} stroke="hsl(var(--border))" />
          <text x={x(t)} y={H - 6} textAnchor="middle" fontSize={12} fill="hsl(var(--muted-foreground))">
            {format(t)}
          </text>
        </g>
      ))}
      {refs.map((r, k) => (
        <g key={`ref${k}`}>
          {r.band && r.lo != null && r.hi != null && (
            <rect
              x={x(r.lo)}
              width={Math.max(2, x(r.hi) - x(r.lo))}
              y={top - 4}
              height={H - 18 - top}
              fill="hsl(var(--muted-foreground))"
              opacity={0.16}
            />
          )}
          {r.shadeBeyond && x(domain[1]) > x(r.value) && (
            <rect x={x(r.value)} width={x(domain[1]) - x(r.value)} y={top - 4} height={H - 18 - top} fill={`url(#${hatchId})`} />
          )}
          {!r.band && showCI && r.lo != null && r.hi != null && (
            <rect
              x={x(r.lo)}
              width={x(r.hi) - x(r.lo)}
              y={top - 4}
              height={H - 18 - top}
              fill="hsl(var(--foreground))"
              opacity={0.07}
            />
          )}
          {!r.band && (
            <line
              x1={x(r.value)}
              x2={x(r.value)}
              y1={top - 4}
              y2={H - 22}
              stroke="hsl(var(--foreground))"
              strokeDasharray="4 4"
            />
          )}
          <text
            x={refLabelX(r)}
            y={14 + 18 * (r.row ?? 0)}
            textAnchor={r.anchor ?? 'middle'}
            fontSize={12}
            fill="hsl(var(--foreground))"
          >
            {narrow && r.labelNarrow ? r.labelNarrow : r.label}
          </text>
        </g>
      ))}
      {rows.map((r, i) => {
        const cy = top + i * rowH + rowH / 2 + gapsUpTo(i) * ROW_GAP;
        const hasCI = showCI && r.lo != null && r.hi != null;
        const dumbbell = r.from !== null && r.from !== undefined;
        const hasFromCI = dumbbell && showCI && r.fromLo != null && r.fromHi != null;
        const diamond = r.marker === 'diamond';
        const label = `${r.label}${r.dagger ? '†' : ''}`;
        const tip = (
          <title>
            {label}: {dumbbell ? `${format(r.from as number)} → ` : ''}
            {format(r.value)}
            {r.lo != null && r.hi != null ? ` (95% CI ${format(r.lo)}–${format(r.hi)})` : ''}
            {r.note ? ` · ${r.note}` : ''}
          </title>
        );
        let valueLabel: React.ReactNode;
        if (dumbbell) {
          const text = narrow ? format(r.value) : `${format(r.from as number)} → ${format(r.value)}`;
          const xs = [x(r.value), x(r.from as number)];
          if (hasCI) xs.push(x(r.lo as number), x(r.hi as number));
          if (hasFromCI) xs.push(x(r.fromLo as number), x(r.fromHi as number));
          const right = Math.max(...xs) + 10;
          const fits = right + text.length * 6.5 <= W;
          valueLabel = (
            <text
              x={fits ? right : Math.min(...xs) - 10}
              y={cy + 4}
              textAnchor={fits ? 'start' : 'end'}
              fontSize={fs - 1}
              fill="#001d36"
              stroke="white"
              strokeWidth={3}
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {text}
            </text>
          );
        } else {
          valueLabel = (
            <text
              x={Math.min(x(hasCI ? (r.hi as number) : r.value) + 10, W - 4)}
              y={cy + 4}
              fontSize={fs - 1}
              fill="#001d36"
              {...(halo ? { stroke: 'white', strokeWidth: 3, strokeLinejoin: 'round' as const, paintOrder: 'stroke' } : {})}
            >
              {format(r.value)}
            </text>
          );
        }
        const whisker = (lo: number, hi: number, op = 1) => (
          <g opacity={op}>
            <line x1={x(lo)} x2={x(hi)} y1={cy} y2={cy} stroke={r.color} strokeWidth={2.5} />
            <line x1={x(lo)} x2={x(lo)} y1={cy - 5} y2={cy + 5} stroke={r.color} strokeWidth={2} />
            <line x1={x(hi)} x2={x(hi)} y1={cy - 5} y2={cy + 5} stroke={r.color} strokeWidth={2} />
          </g>
        );
        return (
          <g key={r.label + i}>
            {r.gapBefore && (
              <line
                x1={4}
                x2={W - 4}
                y1={cy - rowH / 2 - ROW_GAP / 2}
                y2={cy - rowH / 2 - ROW_GAP / 2}
                stroke="hsl(var(--border))"
                strokeDasharray="2 3"
              />
            )}
            <text
              x={labelW - 8}
              y={cy + 4}
              textAnchor="end"
              fontSize={fs}
              fill={r.baseline ? 'hsl(var(--muted-foreground))' : '#001d36'}
              fontStyle={r.baseline ? 'italic' : undefined}
            >
              {label}
            </text>
            {dumbbell && (
              <line x1={x(r.from as number)} x2={x(r.value)} y1={cy} y2={cy} stroke={r.color} strokeWidth={2} opacity={0.55} />
            )}
            {hasFromCI && whisker(r.fromLo as number, r.fromHi as number, 0.6)}
            {hasCI && <line x1={x(r.lo as number)} x2={x(r.hi as number)} y1={cy} y2={cy} stroke={r.color} strokeWidth={2.5} />}
            {hasCI && (
              <>
                <line x1={x(r.lo as number)} x2={x(r.lo as number)} y1={cy - 5} y2={cy + 5} stroke={r.color} strokeWidth={2} />
                <line x1={x(r.hi as number)} x2={x(r.hi as number)} y1={cy - 5} y2={cy + 5} stroke={r.color} strokeWidth={2} />
              </>
            )}
            {dumbbell &&
              (diamond ? (
                <Diamond cx={x(r.from as number)} cy={cy} r={6} fill="white" stroke={r.color} strokeWidth={2} />
              ) : (
                <circle cx={x(r.from as number)} cy={cy} r={5} fill="white" stroke={r.color} strokeWidth={2} />
              ))}
            {diamond ? (
              <Diamond cx={x(r.value)} cy={cy} r={7} fill={r.color} stroke="white" strokeWidth={1.5}>
                {tip}
              </Diamond>
            ) : (
              <circle cx={x(r.value)} cy={cy} r={6} fill={r.color} stroke="white" strokeWidth={1.5}>
                {tip}
              </circle>
            )}
            {valueLabel}
          </g>
        );
      })}
    </svg>
    </div>
  );
};

/** Legend entry drawn with the same marks as the charts (shape carries meaning, not only colour). */
export type LegendMark = 'dot' | 'hollow' | 'diamond' | 'dash' | 'swatch' | 'hatch';

export const MarkLegend: React.FC<{ items: { mark: LegendMark; color?: string; label: React.ReactNode }[]; className?: string }> = ({
  items,
  className,
}) => (
  <div className={cn('flex flex-wrap gap-x-4 gap-y-1 text-sm font-beezee text-muted-foreground', className)}>
    {items.map((it, i) => {
      const c = it.color ?? NEWER;
      return (
        <span key={i} className="inline-flex items-center gap-1.5">
          <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden className="shrink-0">
            {it.mark === 'dot' && <circle cx={7} cy={7} r={5} fill={c} />}
            {it.mark === 'hollow' && <circle cx={7} cy={7} r={4.5} fill="white" stroke={c} strokeWidth={2} />}
            {it.mark === 'diamond' && <path d="M7 1.5L12.5 7L7 12.5L1.5 7Z" fill={c} />}
            {it.mark === 'dash' && <line x1={0} x2={14} y1={7} y2={7} stroke={c} strokeWidth={1.5} strokeDasharray="3 2" />}
            {it.mark === 'swatch' && <rect x={1} y={1} width={12} height={12} rx={2} fill={c} stroke="hsl(var(--border))" />}
            {it.mark === 'hatch' && (
              <g>
                <rect x={1} y={1} width={12} height={12} rx={2} fill="white" stroke="hsl(var(--border))" />
                {[3, 7, 11].map((o) => (
                  <line key={o} x1={o - 4} y1={13} x2={o + 4} y2={1} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.6} />
                ))}
              </g>
            )}
          </svg>
          {it.label}
        </span>
      );
    })}
  </div>
);

/** Full-width divider between story chapters: hairline, small caps label, hairline. */
export const ChapterBreak: React.FC<{ id: string; label: string }> = ({ id, label }) => (
  <div id={id} className="max-w-5xl mx-auto mt-16 mb-8 flex items-center gap-4 scroll-mt-6">
    <div className="h-px flex-1 bg-border" />
    <div className="font-beezee text-[13px] tracking-widest uppercase text-navy text-center">{label}</div>
    <div className="h-px flex-1 bg-border" />
  </div>
);

/** "† {label} ran with {note}. {detail}" for each model with a settings note; nothing when there are none. */
export const SettingsFootnote: React.FC<{ notes: { label: string; text: string }[]; extra?: React.ReactNode }> = ({
  notes,
  extra,
}) =>
  notes.length || extra ? (
    <p className="mt-2 text-[13px] font-beezee text-muted-foreground leading-snug">
      {notes.map((n, i) => (
        <span key={i}>
          {i > 0 && ' '}† {n.text}
        </span>
      ))}
      {extra && (
        <>
          {notes.length ? ' ' : ''}
          {extra}
        </>
      )}
    </p>
  ) : null;

// ── Metrics table: scrolls inside its card on phones, first column stays put ──

export type MetricsColumn = { key: string; label: string; short?: string; num?: boolean };
export type MetricsRow = {
  cells: Record<string, React.ReactNode>;
  kind?: 'model' | 'baseline' | 'human';
  sepBefore?: boolean;
};

export const MetricsTable: React.FC<{ columns: MetricsColumn[]; rows: MetricsRow[]; caption: string; id?: string }> = ({
  columns,
  rows,
  caption,
  id,
}) => (
  <div>
    <p className="sm:hidden mb-1 text-xs font-beezee text-muted-foreground">Scroll the table sideways for more columns →</p>
    <div className="overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
      <table id={id} className="w-full border-collapse font-beezee text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((c, j) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  'px-1.5 sm:px-2 py-2 font-semibold text-muted-foreground align-bottom',
                  c.num ? 'text-right' : 'text-left',
                  j === 0 ? 'sticky left-0 z-10 bg-white min-w-[6.5rem] max-w-[8.5rem] sm:min-w-[9rem] sm:max-w-[14rem]' : 'min-w-[4.5rem] leading-tight'
                )}
              >
                {c.short ? (
                  <>
                    <span className="sm:hidden">{c.short}</span>
                    <span className="max-sm:hidden">{c.label}</span>
                  </>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={cn(
                'border-b border-border/60',
                r.sepBefore && 'border-t-2 border-t-border',
                r.kind === 'baseline' && 'italic text-muted-foreground',
                r.kind === 'human' && 'text-muted-foreground'
              )}
            >
              {columns.map((c, j) =>
                j === 0 ? (
                  <th
                    key={c.key}
                    scope="row"
                    className="sticky left-0 z-10 bg-white px-1.5 sm:px-2 py-1.5 text-left font-normal min-w-[6.5rem] max-w-[8.5rem] sm:min-w-[9rem] sm:max-w-[14rem] leading-snug"
                  >
                    {r.cells[c.key] ?? ''}
                  </th>
                ) : (
                  <td key={c.key} className={cn('px-1.5 sm:px-2 py-1.5 tabular-nums whitespace-nowrap', c.num ? 'text-right' : 'text-left')}>
                    {r.cells[c.key] ?? '—'}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/** Value with its interval in small muted text, for tables when statistics are on. */
export const WithCI: React.FC<{ value: string; lo?: string | null; hi?: string | null; stats: boolean }> = ({ value, lo, hi, stats }) => (
  <>
    {value}
    {stats && lo != null && hi != null && (
      <span className="ml-1 text-xs text-muted-foreground">
        [{lo}, {hi}]
      </span>
    )}
  </>
);

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
