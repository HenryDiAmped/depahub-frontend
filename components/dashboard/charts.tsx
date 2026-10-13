"use client";

export type ChartSlice = {
  name: string;
  value: number;
  color: string;
};

export function DonutChart({
  data,
  size = 176,
  thickness = 26,
  centerLabel,
  centerValue,
  formatValue,
}: {
  data: ChartSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  formatValue?: (value: number) => string;
}) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  if (total <= 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No hay datos para mostrar
      </p>
    );
  }

  const radius = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        role="img"
        aria-label={centerLabel ?? "Gráfico circular"}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(220, 20%, 92%)"
          strokeWidth={thickness}
        />
        {data.map((slice) => {
          if (slice.value <= 0) return null;
          const length = (slice.value / total) * circumference;
          const circle = (
            <circle
              key={slice.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += length;
          return circle;
        })}
        <text
          x="50%"
          y={centerLabel ? "46%" : "50%"}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground"
          style={{ fontSize: 22, fontWeight: 700 }}
        >
          {centerValue ?? String(total)}
        </text>
        {centerLabel && (
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em" }}
          >
            {centerLabel.toUpperCase()}
          </text>
        )}
      </svg>
      <ul className="w-full space-y-2 sm:w-auto">
        {data.map((slice) => {
          const percent = Math.round((slice.value / total) * 100);
          return (
            <li key={slice.name} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: slice.color }}
                />
                {slice.name}
              </span>
              <span className="font-semibold tabular-nums text-muted-foreground">
                {formatValue ? formatValue(slice.value) : slice.value} · {percent}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export type BarSeries = {
  key: string;
  label: string;
  color: string;
};

export function GroupedBarChart({
  data,
  series,
  formatValue,
}: {
  data: Array<Record<string, string | number>>;
  series: BarSeries[];
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(
    1,
    ...data.flatMap((row) => series.map((item) => Number(row[item.key]) || 0))
  );

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No hay datos para mostrar
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {series.map((item) => (
          <span key={item.key} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <div
          className="flex h-56 min-w-full items-end gap-3 px-1"
          style={{ minWidth: `${Math.max(data.length * 72, 280)}px` }}
        >
          {data.map((row) => (
            <div
              key={String(row.label)}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-44 w-full items-end justify-center gap-1">
                {series.map((item) => {
                  const value = Number(row[item.key]) || 0;
                  const height = Math.max((value / max) * 100, value > 0 ? 4 : 0);
                  return (
                    <div
                      key={item.key}
                      className="w-full max-w-5 rounded-t-sm"
                      style={{
                        height: `${height}%`,
                        background: item.color,
                      }}
                      title={`${item.label}: ${formatValue ? formatValue(value) : value}`}
                    />
                  );
                })}
              </div>
              <span className="w-full truncate text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {String(row.label)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HorizontalBarChart({
  data,
  formatValue,
}: {
  data: ChartSlice[];
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(1, ...data.map((item) => item.value));

  if (data.length === 0 || data.every((item) => item.value === 0)) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No hay datos para mostrar
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="truncate font-medium text-foreground">{item.name}</span>
            <span className="ml-2 shrink-0 font-semibold tabular-nums text-muted-foreground">
              {formatValue ? formatValue(item.value) : item.value}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[hsl(220,20%,93%)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
