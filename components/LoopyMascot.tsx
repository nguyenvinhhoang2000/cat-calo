import * as React from "react";

export type Mood = "hungry" | "happy" | "content" | "full" | "over";

// Bảng màu bé hải ly hồng (lấy cảm hứng phong cách Loopy — tác phẩm gốc)
const FUR = "#f7a3c1"; // hồng thân
const FUR_LINE = "#e58bad"; // viền hồng đậm
const EAR_INNER = "#f08fb2"; // trong tai
const CHEEK = "#f272a0"; // má hồng
const MUZZLE = "#fff6fa"; // vùng mõm sáng
const TEETH = "#ffffff"; // răng cửa
const TEETH_LINE = "#e9c3d3"; // viền răng
const NOSE = "#6b3f52"; // mũi nâu mận
const LINE = "#5c3a46"; // nét mắt / miệng

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "full") {
    // mắt cười ^ ^
    return (
      <g stroke={LINE} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M62 100 q12 -13 24 0" />
        <path d="M114 100 q12 -13 24 0" />
      </g>
    );
  }
  if (mood === "over") {
    // mắt hoa (no quá) > <
    return (
      <g stroke={LINE} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M62 96 l18 6 l-18 6" />
        <path d="M138 96 l-18 6 l18 6" />
      </g>
    );
  }
  // mắt tròn đen long lanh
  return (
    <g>
      <circle cx={74} cy={102} r={9.5} fill={LINE} />
      <circle cx={126} cy={102} r={9.5} fill={LINE} />
      <circle cx={77.5} cy={98.5} r={3} fill="#fff" />
      <circle cx={129.5} cy={98.5} r={3} fill="#fff" />
      {(mood === "happy" || mood === "hungry") && (
        <>
          <circle cx={71} cy={105} r={1.8} fill="#fff" opacity={0.85} />
          <circle cx={123} cy={105} r={1.8} fill="#fff" opacity={0.85} />
        </>
      )}
    </g>
  );
}

// Hai răng cửa to — đặc trưng của bé hải ly
function Teeth() {
  return (
    <g stroke={TEETH_LINE} strokeWidth={1.5}>
      <rect x={92} y={129} width={7.5} height={19} rx={3} fill={TEETH} />
      <rect x={100.5} y={129} width={7.5} height={19} rx={3} fill={TEETH} />
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  const common = {
    stroke: LINE,
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    fill: "none",
  };
  return (
    <g>
      {/* nét miệng hai bên trên răng, đổi theo tâm trạng */}
      {mood === "over" ? (
        <path d="M78 126 q6 -6 12 0 q6 6 12 0 q6 -6 12 0" {...common} />
      ) : mood === "full" ? (
        <path d="M80 126 q20 12 40 0" {...common} />
      ) : (
        <path d="M84 126 q16 9 32 0" {...common} />
      )}

      {/* lưỡi thè khi đói */}
      {mood === "hungry" && (
        <ellipse
          cx={100}
          cy={150}
          rx={6}
          ry={4.5}
          fill={NOSE}
          opacity={0.5}
        />
      )}

      <Teeth />
    </g>
  );
}

export function LoopyMascot({
  mood = "content",
  size = 200,
  className = "",
}: {
  mood?: Mood;
  size?: number;
  className?: string;
}) {
  const cheekOpacity = mood === "full" || mood === "over" ? 0.9 : 0.65;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Bé Loopy mascot LoopyCalo"
    >
      {/* Tai tròn nhỏ */}
      <ellipse cx={56} cy={54} rx={21} ry={21} fill={FUR} stroke={FUR_LINE} strokeWidth={3} />
      <ellipse cx={144} cy={54} rx={21} ry={21} fill={FUR} stroke={FUR_LINE} strokeWidth={3} />
      <ellipse cx={56} cy={56} rx={10.5} ry={10.5} fill={EAR_INNER} />
      <ellipse cx={144} cy={56} rx={10.5} ry={10.5} fill={EAR_INNER} />

      {/* Đầu */}
      <ellipse cx={100} cy={112} rx={74} ry={66} fill={FUR} stroke={FUR_LINE} strokeWidth={3} />

      {/* Má hồng */}
      <ellipse cx={52} cy={126} rx={15} ry={9} fill={CHEEK} opacity={cheekOpacity} />
      <ellipse cx={148} cy={126} rx={15} ry={9} fill={CHEEK} opacity={cheekOpacity} />

      {/* Vùng mõm sáng quanh mũi & răng */}
      <ellipse cx={100} cy={128} rx={31} ry={27} fill={MUZZLE} />

      <Eyes mood={mood} />

      {/* Mũi */}
      <ellipse cx={100} cy={118} rx={9} ry={7} fill={NOSE} />
      <ellipse cx={97} cy={116} rx={2.5} ry={1.8} fill="#fff" opacity={0.4} />

      <Mouth mood={mood} />

      {/* Chi tiết theo tâm trạng */}
      {mood === "happy" && (
        <g fill={CHEEK}>
          <path d="M166 62 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" opacity={0.9} />
          <path d="M28 50 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" opacity={0.7} />
        </g>
      )}
      {mood === "over" && (
        <path d="M152 72 q6 10 0 16 q-6 -6 0 -16 z" fill="#8fd3f0" opacity={0.9} />
      )}
    </svg>
  );
}

export default LoopyMascot;
