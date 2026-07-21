import * as React from "react";

export type CatMood = "hungry" | "happy" | "content" | "full" | "over";

const FUR = "#fffdfe";
const FUR_LINE = "#f4cfdd";
const EAR_INNER = "#fbd5e3";
const BLUSH = "#f7a8c4";
const NOSE = "#ec6a96";
const LINE = "#b06b80";

function Eyes({ mood }: { mood: CatMood }) {
  if (mood === "full") {
    // mắt cười ^ ^
    return (
      <g stroke={LINE} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M64 108 q10 -12 20 0" />
        <path d="M116 108 q10 -12 20 0" />
      </g>
    );
  }
  if (mood === "over") {
    // mắt xoắn (no ăn quá) > <
    return (
      <g stroke={LINE} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M64 104 l18 6 l-18 6" />
        <path d="M136 104 l-18 6 l18 6" />
      </g>
    );
  }
  // mắt tròn long lanh
  return (
    <g>
      <circle cx={74} cy={110} r={11} fill={LINE} />
      <circle cx={126} cy={110} r={11} fill={LINE} />
      <circle cx={78} cy={106} r={3.5} fill="#fff" />
      <circle cx={130} cy={106} r={3.5} fill="#fff" />
      {(mood === "happy" || mood === "hungry") && (
        <>
          <circle cx={70} cy={114} r={2} fill="#fff" opacity={0.85} />
          <circle cx={122} cy={114} r={2} fill="#fff" opacity={0.85} />
        </>
      )}
    </g>
  );
}

function Mouth({ mood }: { mood: CatMood }) {
  const common = {
    stroke: LINE,
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    fill: "none",
  };
  if (mood === "hungry") {
    return (
      <g {...common}>
        <path d="M92 132 q8 6 16 0" />
        <ellipse cx={100} cy={140} rx={6} ry={7} fill={NOSE} stroke="none" opacity={0.55} />
      </g>
    );
  }
  if (mood === "over") {
    return <path d="M88 138 q6 -7 12 0 q6 7 12 0" {...common} />;
  }
  if (mood === "full") {
    return <path d="M84 134 q16 16 32 0" {...common} />;
  }
  // happy / content: cười cong nhẹ
  return <path d="M88 133 q12 11 24 0" {...common} />;
}

export function CatMascot({
  mood = "content",
  size = 200,
  className = "",
}: {
  mood?: CatMood;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Mèo mascot MèoCalo"
    >
      {/* Tai */}
      <path d="M42 78 L52 26 L92 58 Z" fill={FUR} stroke={FUR_LINE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M158 78 L148 26 L108 58 Z" fill={FUR} stroke={FUR_LINE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M52 66 L57 38 L79 58 Z" fill={EAR_INNER} />
      <path d="M148 66 L143 38 L121 58 Z" fill={EAR_INNER} />

      {/* Đầu */}
      <ellipse cx={100} cy={112} rx={70} ry={62} fill={FUR} stroke={FUR_LINE} strokeWidth={3} />

      {/* Má hồng */}
      <ellipse cx={58} cy={126} rx={13} ry={8} fill={BLUSH} opacity={mood === "full" || mood === "over" ? 0.85 : 0.6} />
      <ellipse cx={142} cy={126} rx={13} ry={8} fill={BLUSH} opacity={mood === "full" || mood === "over" ? 0.85 : 0.6} />

      <Eyes mood={mood} />

      {/* Mũi */}
      <path d="M96 122 L104 122 L100 128 Z" fill={NOSE} />

      <Mouth mood={mood} />

      {/* Ria mép */}
      <g stroke={FUR_LINE} strokeWidth={2.5} strokeLinecap="round">
        <line x1={30} y1={116} x2={58} y2={118} />
        <line x1={28} y1={128} x2={57} y2={126} />
        <line x1={170} y1={116} x2={142} y2={118} />
        <line x1={172} y1={128} x2={143} y2={126} />
      </g>

      {/* Chi tiết theo tâm trạng */}
      {mood === "happy" && (
        <g fill={NOSE}>
          <path d="M164 60 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" opacity={0.9} />
          <path d="M30 52 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" opacity={0.7} />
        </g>
      )}
      {mood === "over" && (
        <path
          d="M150 74 q6 10 0 16 q-6 -6 0 -16 z"
          fill="#8fd3f0"
          opacity={0.9}
        />
      )}
    </svg>
  );
}

export default CatMascot;
