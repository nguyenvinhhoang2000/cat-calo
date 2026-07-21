import * as React from "react";
import CatMascot, { CatMood } from "./CatMascot";

function moodFor(pct: number): CatMood {
  if (pct <= 0) return "hungry";
  if (pct < 55) return "happy";
  if (pct < 90) return "content";
  if (pct <= 105) return "full";
  return "over";
}

export function CalorieRing({
  consumed,
  goal,
}: {
  consumed: number;
  goal: number;
}) {
  const pct = goal > 0 ? (consumed / goal) * 100 : 0;
  const clamped = Math.max(0, Math.min(pct, 100));
  const over = pct > 100;
  const remaining = Math.round(goal - consumed);

  const R = 92;
  const C = 2 * Math.PI * R;
  const offset = C - (clamped / 100) * C;

  const mood = moodFor(pct);

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 220 220" className="w-[260px] h-[260px] max-w-full">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffb3cd" />
            <stop offset="100%" stopColor={over ? "#d94e80" : "#ec6a96"} />
          </linearGradient>
        </defs>

        {/* rãnh nền */}
        <circle
          cx="110"
          cy="110"
          r={R}
          fill="none"
          stroke="#fbd5e3"
          strokeWidth="16"
          opacity={0.55}
        />
        {/* phần đã nạp */}
        <circle
          cx="110"
          cy="110"
          r={R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform="rotate(-90 110 110)"
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
      </svg>

      {/* Mèo + số liệu ở giữa */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <CatMascot mood={mood} size={116} className="animate-floaty -mt-2" />
        <div className="text-center -mt-1">
          <div className="font-display text-3xl font-bold leading-none text-plum">
            {Math.round(consumed)}
          </div>
          <div className="text-xs font-semibold text-plum-soft mt-0.5">
            / {goal} kcal
          </div>
        </div>
      </div>

      <div className="mt-3 text-sm font-semibold text-center">
        {over ? (
          <span className="text-rose-deep">
            Vượt {Math.abs(remaining)} kcal so với mục tiêu 🙀
          </span>
        ) : (
          <span className="text-plum-soft">
            Còn lại{" "}
            <span className="text-rose font-bold">{remaining} kcal</span> nữa nha 🐾
          </span>
        )}
      </div>
    </div>
  );
}

export default CalorieRing;
