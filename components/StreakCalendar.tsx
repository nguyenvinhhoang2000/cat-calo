"use client";

import * as React from "react";
import { useMemo } from "react";
import type { HistoryDay } from "@/lib/db";
import { isToday } from "@/lib/date";

// Thứ trong tuần theo kiểu Thứ 2 đứng đầu: T2=0 … CN=6.
function weekdayMonFirst(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

function dayNum(key: string) {
  return Number(key.split("-")[2]);
}

// Icon mèo hồng nhỏ, dùng làm dấu "đạt". Màu lấy theo currentColor.
function PinkCat({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Tai */}
      <path d="M5 10 L7 3 L11 9 Z" />
      <path d="M19 10 L17 3 L13 9 Z" />
      {/* Đầu */}
      <circle cx="12" cy="14" r="7.2" />
      {/* Mắt */}
      <circle cx="9.4" cy="13.4" r="1.05" fill="#fff" />
      <circle cx="14.6" cy="13.4" r="1.05" fill="#fff" />
      {/* Mũi */}
      <path d="M11 16 L13 16 L12 17.2 Z" fill="#fff" />
    </svg>
  );
}

/**
 * Lịch 30 ngày hiển thị streak: mỗi ô là một ngày, tô màu theo trạng thái
 * (đạt mục tiêu / vượt / chưa ghi). Bấm một ô để mở ngày đó.
 */
export function StreakCalendar({
  days,
  streak,
  selectedDate,
  onSelect,
  fallbackGoal,
}: {
  days: HistoryDay[]; // theo thứ tự cũ → mới
  streak: number;
  selectedDate: string;
  onSelect: (date: string) => void;
  fallbackGoal: number;
}) {
  const isActive = (d: HistoryDay) => d.eaten > 0 || d.burned > 0;
  const hit = (d: HistoryDay) => {
    const g = d.goal ?? fallbackGoal;
    return isActive(d) && g > 0 && d.net <= g;
  };

  const hitCount = useMemo(() => days.filter(hit).length, [days, fallbackGoal]);
  const pad = days.length ? weekdayMonFirst(days[0].date) : 0;
  const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-xl">🔥</span>
          <span className="font-display text-3xl font-bold text-rose">
            {streak}
          </span>
          <span className="text-sm font-semibold text-plum-soft">
            ngày liên tiếp
          </span>
        </div>
        <span className="text-xs font-semibold text-plum-soft">
          {hitCount}/{days.length} ngày đạt
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {labels.map((l) => (
          <div key={l} className="text-[10px] font-semibold text-plum-soft/80">
            {l}
          </div>
        ))}
        {Array.from({ length: pad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((d) => {
          const active = isActive(d);
          const ok = hit(d); // đạt mục tiêu
          const today = isToday(d.date);
          const selected = d.date === selectedDate;
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelect(d.date)}
              aria-label={
                ok
                  ? `${d.date}: đạt mục tiêu (${d.net}/${d.goal ?? fallbackGoal} kcal)`
                  : active
                    ? `${d.date}: chưa đạt (${d.net}/${d.goal ?? fallbackGoal} kcal)`
                    : `${d.date}: chưa ghi`
              }
              title={
                active
                  ? `${d.date}\nnet ${d.net} / mục tiêu ${d.goal ?? fallbackGoal} kcal${
                      d.burned > 0 ? `\n(ăn ${d.eaten} − đốt ${d.burned})` : ""
                    }`
                  : `${d.date}: chưa ghi`
              }
              className={`relative flex aspect-square items-center justify-center rounded-lg border border-rose-soft/40 bg-white transition hover:opacity-80 ${
                selected
                  ? "ring-2 ring-rose-deep"
                  : today
                    ? "ring-2 ring-plum-soft"
                    : ""
              }`}
            >
              {ok ? (
                <PinkCat className="h-[70%] w-[70%] text-rose" />
              ) : (
                <span className="text-[11px] font-bold text-plum-soft/50">
                  {dayNum(d.date)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chú thích */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-plum-soft">
        <span className="flex items-center gap-1">
          <PinkCat className="h-3.5 w-3.5 text-rose" />
          Đạt mục tiêu
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-rose-soft/60 bg-white" />
          Chưa đạt
        </span>
      </div>
    </div>
  );
}

export default StreakCalendar;
