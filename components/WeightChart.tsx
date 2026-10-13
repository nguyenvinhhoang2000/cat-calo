import * as React from "react";

export type WeightPoint = { date: string; kg: number };

function ddmm(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/**
 * Biểu đồ đường cân nặng theo ngày (SVG thuần, tông hồng pastel).
 * Tự co giãn trục Y theo dữ liệu, làm nổi điểm mới nhất.
 */
export function WeightChart({ data }: { data: WeightPoint[] }) {
  const W = 640;
  const H = 260;
  const padL = 44;
  const padR = 18;
  const padT = 20;
  const padB = 38;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const kgs = data.map((d) => d.kg);
  let lo = Math.min(...kgs);
  let hi = Math.max(...kgs);
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const pad = Math.max(0.4, (hi - lo) * 0.15);
  const yMin = lo - pad;
  const yMax = hi + pad;

  const n = data.length;
  const x = (i: number) =>
    n === 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW;
  const y = (kg: number) => padT + (1 - (kg - yMin) / (yMax - yMin)) * plotH;

  const pts = data.map((d, i) => ({ px: x(i), py: y(d.kg), ...d }));
  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`)
    .join(" ");
  const areaPath =
    pts.length > 0
      ? `${linePath} L ${pts[pts.length - 1].px.toFixed(1)} ${padT + plotH} L ${pts[0].px.toFixed(1)} ${padT + plotH} Z`
      : "";

  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  const maxLabels = 6;
  const step = Math.max(1, Math.ceil(n / maxLabels));
  const showLabel = (i: number) => i === 0 || i === n - 1 || i % step === 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Biểu đồ cân nặng theo ngày"
    >
      <defs>
        <linearGradient id="wArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ec6a96" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ec6a96" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => {
        const yy = y(t);
        return (
          <g key={i}>
            <line
              x1={padL}
              y1={yy}
              x2={W - padR}
              y2={yy}
              stroke="#fbd5e3"
              strokeWidth={1}
              strokeDasharray="4 5"
            />
            <text
              x={padL - 8}
              y={yy + 4}
              textAnchor="end"
              fontSize="11"
              fill="#9a7280"
              fontWeight={600}
            >
              {t.toFixed(1)}
            </text>
          </g>
        );
      })}

      {n > 1 && <path d={areaPath} fill="url(#wArea)" />}
      {n > 1 && (
        <path
          d={linePath}
          fill="none"
          stroke="#ec6a96"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {pts.map((p, i) => {
        const last = i === n - 1;
        return (
          <g key={p.date}>
            {last && <circle cx={p.px} cy={p.py} r={9} fill="#ec6a96" opacity={0.18} />}
            <circle
              cx={p.px}
              cy={p.py}
              r={last ? 5.5 : 4}
              fill={last ? "#d94e80" : "#ec6a96"}
              stroke="#fffdfe"
              strokeWidth={2}
            />
            {showLabel(i) && (
              <text
                x={p.px}
                y={H - 14}
                textAnchor="middle"
                fontSize="11"
                fill="#9a7280"
                fontWeight={600}
              >
                {ddmm(p.date)}
              </text>
            )}
          </g>
        );
      })}

      {pts.length > 0 && (
        <text
          x={Math.min(pts[n - 1].px, W - padR - 2)}
          y={Math.max(padT + 10, pts[n - 1].py - 12)}
          textAnchor={n === 1 ? "middle" : "end"}
          fontSize="13"
          fontWeight={700}
          fill="#d94e80"
        >
          {pts[n - 1].kg.toFixed(1)} kg
        </text>
      )}
    </svg>
  );
}

export default WeightChart;
