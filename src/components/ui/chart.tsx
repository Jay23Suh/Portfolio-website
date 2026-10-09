import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '../../lib/utils';

// shadcn/ui chart (recharts v2). Series colors come from `config` and are exposed as --color-<key>.

export type ChartConfig = {
  [k in string]: { label?: React.ReactNode; icon?: React.ComponentType; color?: string };
};

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error('useChart must be used within a <ChartContainer />');
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, c]) => c.color);
  if (!colorConfig.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {\n${colorConfig
          .map(([key, c]) => `  --color-${key}: ${c.color};`)
          .join('\n')}\n}`,
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  name?: string | number;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
  payload?: Record<string, unknown>;
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: React.ReactNode;
    className?: string;
    hideLabel?: boolean;
    nameKey?: string;
    valueFormatter?: (value: number | string) => React.ReactNode;
    labelFormatter?: (label: React.ReactNode, payload: TooltipPayloadItem[]) => React.ReactNode;
  }
>(({ active, payload, label, className, hideLabel = false, nameKey, valueFormatter, labelFormatter }, ref) => {
  const { config } = useChart();
  if (!active || !payload?.length) return null;
  return (
    <div
      ref={ref}
      className={cn('grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl', className)}
    >
      {!hideLabel && (
        <div className="font-medium text-foreground">{labelFormatter ? labelFormatter(label, payload) : label}</div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, i) => {
          const key = String((nameKey && item.payload?.[nameKey]) || item.dataKey || item.name || 'value');
          const itemConfig = config[key];
          const color = (item.payload?.fill as string) || item.color;
          return (
            <div key={i} className="flex w-full items-center gap-2">
              <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
              <div className="flex flex-1 justify-between gap-4 leading-none">
                <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                {item.value !== undefined && (
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {valueFormatter ? valueFormatter(item.value) : item.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = 'ChartTooltip';

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  { className?: string; payload?: { value?: string; dataKey?: string | number; color?: string }[]; nameKey?: string }
>(({ className, payload, nameKey }, ref) => {
  const { config } = useChart();
  if (!payload?.length) return null;
  return (
    <div ref={ref} className={cn('flex items-center justify-center gap-4 pt-3', className)}>
      {payload.map((item) => {
        const key = String(nameKey || item.dataKey || item.value || 'value');
        const itemConfig = config[key];
        return (
          <div key={key} className="flex items-center gap-1.5">
            <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{itemConfig?.label || item.value}</span>
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = 'ChartLegend';

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
