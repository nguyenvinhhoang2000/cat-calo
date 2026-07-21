"use client";

import * as React from "react";
import { useMemo } from "react";
import type { HistoryDay } from "@/lib/db";
import { isToday, shortLabel } from "@/lib/date";

/**
 * Bảng lịch sử calo nhiều ngày, dạng thanh ngang. Bấm vào một ngày để
 * xem/chỉnh nhật ký của ngày đó.
 */
export function HistoryPanel({
  history,
  selectedDate,
  onSelect,
  fallbackGoal,
}: {
  history: HistoryDay[];
  selectedDate: string;
  onSelect: (date: string) => void;
  fallbackGoal: number;
}) {
  // Trung bình chỉ tính trên các ngày thực sự có ghi món.
  const avg = useMemo(() => {
    const active = history.filter((d) => d.count > 0);
    if (active.length === 0) return 0;
    const sum = active.reduce((s, d) => s + d.total, 0);
    return Math.round(sum / active.length);
  }, [history]);

  const daysHitGoal = useMemo(
    () =>
      history.filter((d) => {
        const g = d.goal ?? fallbackGoal;
        return d.count > 0 && g > 0 && d.total <= g;
      }).length,
    [history, fallbackGoal]
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-rose-tint px-3 py-2 text-center">
          <div className="font-display text-xl font-bold text-rose">{avg}</div>
          <div className="text-xs font-semibold text-plum-soft">
            TB mỗi ngày
          </div>
        </div>
        <div className="rounded-2xl bg-mint/50 px-3 py-2 text-center">
          <div className="font-display text-xl font-bold text-plum">
            {daysHitGoal}
          </div>
          <div className="text-xs font-semibold text-plum-soft">
            ngày đạt mục tiêu
          </div>
        </div>
      </div>

      <ul className="space-y-1.5">
        {history.map((d) => {
          const goal = d.goal ?? fallbackGoal;
          const pct = goal > 0 ? Math.min(100, (d.total / goal) * 100) : 0;
          const over = goal > 0 && d.total > goal;
          const active = d.date === selectedDate;
          return (
            <li key={d.date}>
              <button
                type="button"
                onClick={() => onSelect(d.date)}
                aria-current={active ? "true" : undefined}
                className={`w-full rounded-2xl px-3 py-2 text-left transition ${
                  active
                    ? "bg-rose-tint ring-2 ring-rose-soft"
                    : "bg-blush hover:bg-rose-tint/70"
                }`}
              >
                <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                  <span className="capitalize text-plum">
                    {shortLabel(d.date)}
                    {isToday(d.date) && (
                      <span className="ml-1 text-rose">• hôm nay</span>
                    )}
                  </span>
                  <span className={over ? "text-rose-deep" : "text-plum-soft"}>
                    {d.total > 0 ? `${d.total} kcal` : "—"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-rose-soft/40">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      over ? "bg-rose-deep" : "bg-rose"
                    }`}
                    style={{ width: `${d.total > 0 ? Math.max(6, pct) : 0}%` }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default HistoryPanel;
