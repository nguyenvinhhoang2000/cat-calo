"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Chip, Input } from "@heroui/react";
import CalorieRing from "@/components/CalorieRing";
import CatMascot from "@/components/CatMascot";
import HistoryPanel from "@/components/HistoryPanel";
import { MEALS, MealType, QUICK_FOODS } from "@/lib/foods";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";
import {
  addDays,
  fullLabel,
  isToday,
  todayKey,
} from "@/lib/date";
import {
  addEntry as dbAddEntry,
  clearDay as dbClearDay,
  getDayData,
  getHistory,
  getLatestGoal,
  removeEntry as dbRemoveEntry,
  upsertGoal,
  type Entry,
  type HistoryDay,
} from "@/lib/db";

const DEFAULT_GOAL = 1800;

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé.";
}

export default function Page() {
  const [deviceId, setDeviceId] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [goal, setGoal] = useState(DEFAULT_GOAL);
  // Giá trị mục tiêu đang thực sự lưu trong Supabase cho ngày đang xem
  // (null = ngày này chưa từng đặt mục tiêu). Dùng để biết có thay đổi
  // chưa lưu hay không.
  const [savedGoal, setSavedGoal] = useState<number | null>(null);
  const [savingGoal, setSavingGoal] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<HistoryDay[]>([]);

  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [showCalc, setShowCalc] = useState(false);

  // Lấy mã thiết bị sau khi mount (chỉ có ở phía client).
  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  // Nạp lại toàn bộ dữ liệu mỗi khi đổi thiết bị hoặc đổi ngày.
  useEffect(() => {
    if (!deviceId) return;
    if (!isSupabaseConfigured) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await getDayData(deviceId, selectedDate);
        let g = data.goal;
        if (g == null) g = (await getLatestGoal(deviceId)) ?? DEFAULT_GOAL;
        const hist = await getHistory(deviceId, 7);
        if (cancelled) return;
        setGoal(g);
        setSavedGoal(data.goal); // giá trị đã lưu thật cho ngày này (có thể null)
        setEntries(data.entries);
        setHistory(hist);
        setErr(null);
      } catch (e) {
        if (!cancelled) setErr(errMsg(e));
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deviceId, selectedDate]);

  const refreshHistory = useCallback(async () => {
    if (!isSupabaseConfigured || !deviceId) return;
    try {
      setHistory(await getHistory(deviceId, 7));
    } catch {
      /* lịch sử không quan trọng bằng thao tác chính, bỏ qua lỗi */
    }
  }, [deviceId]);

  const consumed = useMemo(
    () => entries.reduce((sum, e) => sum + e.kcal, 0),
    [entries]
  );

  const grouped = useMemo(() => {
    const map: Record<MealType, Entry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    for (const e of entries) map[e.meal].push(e);
    return map;
  }, [entries]);

  async function addEntry(n: string, k: number, m: MealType) {
    const kk = Math.round(k);
    if (!n.trim() || !kk || kk <= 0) return;
    const payload = { name: n.trim(), kcal: kk, meal: m };

    // Chưa cấu hình Supabase: chỉ giữ tạm trong bộ nhớ để xem giao diện.
    if (!isSupabaseConfigured || !deviceId) {
      setEntries((prev) => [...prev, { id: newId(), ...payload }]);
      return;
    }
    try {
      const row = await dbAddEntry(deviceId, selectedDate, payload);
      setEntries((prev) => [...prev, row]);
      refreshHistory();
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  function handleAdd() {
    addEntry(name, Number(kcal), meal);
    setName("");
    setKcal("");
  }

  async function removeEntry(id: string) {
    const prev = entries;
    setEntries((p) => p.filter((e) => e.id !== id));
    if (!isSupabaseConfigured || !deviceId) return;
    try {
      await dbRemoveEntry(id);
      refreshHistory();
    } catch (e) {
      setErr(errMsg(e));
      setEntries(prev); // hoàn tác nếu xoá thất bại
    }
  }

  async function clearAll() {
    const prev = entries;
    setEntries([]);
    if (!isSupabaseConfigured || !deviceId) return;
    try {
      await dbClearDay(deviceId, selectedDate);
      refreshHistory();
    } catch (e) {
      setErr(errMsg(e));
      setEntries(prev);
    }
  }

  // Lưu mục tiêu của ngày đang xem vào Supabase (nhấn nút mới lưu).
  async function saveGoal(value: number) {
    if (!value || value <= 0) return;
    if (!isSupabaseConfigured || !deviceId) {
      setSavedGoal(value); // chế độ tạm: coi như đã "lưu" trong bộ nhớ
      return;
    }
    setSavingGoal(true);
    try {
      await upsertGoal(deviceId, selectedDate, value);
      setSavedGoal(value);
      setErr(null);
      refreshHistory();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSavingGoal(false);
    }
  }

  const canGoNext = !isToday(selectedDate);
  const goalDirty = goal > 0 && goal !== savedGoal;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      {/* Tiêu đề */}
      <header className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <CatMascot mood="happy" size={64} className="animate-floaty" />
          <h1 className="font-display text-4xl font-bold text-plum sm:text-5xl">
            Mèo<span className="text-rose">Calo</span>
          </h1>
        </div>
        <p className="mt-2 text-sm font-semibold text-plum-soft sm:text-base">
          Ghi lại calo mỗi ngày cùng bé mèo dễ thương 🐾
        </p>
      </header>

      {/* Điều hướng ngày */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <Button
          isIconOnly
          variant="ghost"
          aria-label="Ngày trước"
          onPress={() => setSelectedDate((d) => addDays(d, -1))}
          className="rounded-full text-plum hover:bg-rose-tint"
        >
          ‹
        </Button>
        <div className="min-w-[220px] text-center">
          <div className="font-display font-bold capitalize text-plum">
            {fullLabel(selectedDate)}
          </div>
          {!isToday(selectedDate) && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayKey())}
              className="text-xs font-semibold text-rose hover:text-rose-deep"
            >
              ↩ Về hôm nay
            </button>
          )}
        </div>
        <Button
          isIconOnly
          variant="ghost"
          aria-label="Ngày sau"
          isDisabled={!canGoNext}
          onPress={() => canGoNext && setSelectedDate((d) => addDays(d, 1))}
          className="rounded-full text-plum hover:bg-rose-tint disabled:opacity-30"
        >
          ›
        </Button>
      </div>

      {/* Cảnh báo chưa cấu hình / lỗi */}
      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-2xl border border-butter bg-butter/40 px-4 py-3 text-sm text-plum">
          ⚠️ Chưa cấu hình Supabase. Điền{" "}
          <code className="font-mono text-rose-deep">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          và{" "}
          <code className="font-mono text-rose-deep">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          trong <code className="font-mono">.env.local</code> để lưu lại dữ liệu.
          Hiện tại app chạy tạm, dữ liệu <b>không được lưu</b>.
        </div>
      )}
      {err && (
        <div className="mb-6 rounded-2xl border border-rose-soft bg-rose-tint px-4 py-3 text-sm text-rose-deep">
          😿 {err}
        </div>
      )}

      <div
        className={`flex flex-col gap-6 transition-opacity lg:grid lg:grid-cols-3 lg:items-start ${
          loading ? "opacity-60" : "opacity-100"
        }`}
      >
        {/* Cột chính (thứ tự hiển thị do class order-* quyết định:
            trên mobile xếp chồng theo order toàn cục, trên desktop
            mỗi cột tự sắp theo order riêng) */}
        <div className="contents lg:flex lg:flex-col lg:gap-6 lg:col-span-2">
          {/* Thêm món */}
          <Card className="order-3 border border-rose-soft/60 bg-cream shadow-sm">
            <Card.Header>
              <Card.Title className="font-display text-xl font-bold text-plum">
                Hôm nay bạn ăn gì? 🍽️
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  aria-label="Tên món ăn"
                  placeholder="Tên món (vd: Bánh mì)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  aria-label="Số calo"
                  type="number"
                  inputMode="numeric"
                  placeholder="kcal"
                  value={kcal}
                  onChange={(e) => setKcal(e.target.value)}
                  className="sm:w-32"
                />
              </div>

              {/* Chọn bữa */}
              <div className="flex flex-wrap gap-2">
                {MEALS.map((m) => {
                  const active = meal === m.id;
                  return (
                    <Button
                      key={m.id}
                      size="sm"
                      variant={active ? "primary" : "outline"}
                      onPress={() => setMeal(m.id)}
                      className={
                        active
                          ? "rounded-full"
                          : "rounded-full border-rose-soft text-plum-soft"
                      }
                    >
                      <span className="mr-1">{m.emoji}</span>
                      {m.label}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="primary"
                fullWidth
                onPress={handleAdd}
                className="rounded-full font-bold"
              >
                Thêm vào nhật ký ✨
              </Button>
            </Card.Content>
          </Card>

          {/* Thêm nhanh */}
          <Card className="order-4 border border-rose-soft/60 bg-cream shadow-sm">
            <Card.Header>
              <Card.Title className="font-display text-lg font-bold text-plum">
                Thêm nhanh 💕
              </Card.Title>
              <Card.Description className="text-plum-soft">
                Chạm để thêm ngay (calo tham khảo mỗi phần)
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-wrap gap-2">
                {QUICK_FOODS.map((f) => (
                  <Button
                    key={f.name}
                    size="sm"
                    variant="ghost"
                    onPress={() => addEntry(f.name, f.kcal, f.meal)}
                    className="rounded-full bg-rose-tint text-plum hover:bg-rose-soft"
                  >
                    <span className="mr-1">{f.emoji}</span>
                    {f.name}
                    <span className="ml-1 text-xs text-plum-soft">{f.kcal}</span>
                  </Button>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Nhật ký theo bữa */}
          <Card className="order-2 border border-rose-soft/60 bg-cream shadow-sm">
            <Card.Header className="flex items-center justify-between">
              <Card.Title className="font-display text-lg font-bold text-plum">
                Nhật ký {isToday(selectedDate) ? "hôm nay" : "ngày này"} 📖
              </Card.Title>
              {entries.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={clearAll}
                  className="text-plum-soft"
                >
                  Xoá hết
                </Button>
              )}
            </Card.Header>
            <Card.Content>
              {entries.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <CatMascot mood="hungry" size={96} />
                  <p className="font-semibold text-plum">
                    Bé mèo đang đói bụng!
                  </p>
                  <p className="text-sm text-plum-soft">
                    Thêm món đầu tiên của ngày ở phía trên nhé.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {MEALS.map((m) => {
                    const items = grouped[m.id];
                    if (items.length === 0) return null;
                    const sub = items.reduce((s, e) => s + e.kcal, 0);
                    return (
                      <div key={m.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-2 font-display font-bold text-plum">
                            <span>{m.emoji}</span>
                            {m.label}
                          </span>
                          <Chip
                            size="sm"
                            variant="soft"
                            className={`${m.color} font-semibold text-plum`}
                          >
                            {sub} kcal
                          </Chip>
                        </div>
                        <ul className="space-y-2">
                          {items.map((e) => (
                            <li
                              key={e.id}
                              className="animate-pop-in flex items-center justify-between rounded-2xl bg-blush px-4 py-2.5"
                            >
                              <span className="font-semibold text-plum">
                                {e.name}
                              </span>
                              <span className="flex items-center gap-3">
                                <span className="font-bold text-rose">
                                  {e.kcal}
                                </span>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  aria-label={`Xoá ${e.name}`}
                                  onPress={() => removeEntry(e.id)}
                                  className="text-plum-soft hover:text-rose-deep"
                                >
                                  ✕
                                </Button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Cột phụ: vòng calo + mục tiêu + lịch sử */}
        <div className="contents lg:flex lg:flex-col lg:gap-6 lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
            <Card className="order-1 border border-rose-soft/60 bg-cream shadow-sm">
              <Card.Content className="flex flex-col items-center pt-6">
                <CalorieRing consumed={consumed} goal={goal} />

                <div className="mt-5 grid w-full grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-rose-tint px-3 py-2 text-center">
                    <div className="font-display text-xl font-bold text-rose">
                      {entries.length}
                    </div>
                    <div className="text-xs font-semibold text-plum-soft">
                      món đã ăn
                    </div>
                  </div>
                  <div className="rounded-2xl bg-mint/50 px-3 py-2 text-center">
                    <div className="font-display text-xl font-bold text-plum">
                      {Math.max(0, Math.round((consumed / goal) * 100 || 0))}%
                    </div>
                    <div className="text-xs font-semibold text-plum-soft">
                      mục tiêu
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Mục tiêu */}
            <Card className="order-5 border border-rose-soft/60 bg-cream shadow-sm">
              <Card.Header>
                <Card.Title className="font-display text-lg font-bold text-plum">
                  Mục tiêu mỗi ngày 🎯
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="Mục tiêu calo mỗi ngày"
                    type="number"
                    inputMode="numeric"
                    value={String(goal)}
                    onChange={(e) => setGoal(Number(e.target.value) || 0)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && goalDirty) saveGoal(goal);
                    }}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-plum-soft">
                    kcal
                  </span>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  isDisabled={!goalDirty || savingGoal}
                  onPress={() => saveGoal(goal)}
                  className="rounded-full font-bold disabled:opacity-60"
                >
                  {savingGoal
                    ? "Đang lưu..."
                    : goalDirty
                      ? "Lưu mục tiêu 💾"
                      : "Đã lưu ✓"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onPress={() => setShowCalc((s) => !s)}
                  className="rounded-full border-rose-soft text-plum-soft"
                >
                  {showCalc ? "Ẩn gợi ý" : "Gợi ý theo cơ thể 🧮"}
                </Button>

                {showCalc && (
                  <GoalCalculator
                    onApply={(v) => {
                      setGoal(v);
                      saveGoal(v);
                    }}
                  />
                )}
              </Card.Content>
            </Card>

            {/* Lịch sử 7 ngày */}
            {isSupabaseConfigured && (
              <Card className="order-6 border border-rose-soft/60 bg-cream shadow-sm">
                <Card.Header>
                  <Card.Title className="font-display text-lg font-bold text-plum">
                    Lịch sử 7 ngày 📅
                  </Card.Title>
                  <Card.Description className="text-plum-soft">
                    Bấm một ngày để xem lại nhật ký
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  {history.length === 0 ? (
                    <p className="py-4 text-center text-sm text-plum-soft">
                      Chưa có dữ liệu lịch sử.
                    </p>
                  ) : (
                    <HistoryPanel
                      history={history}
                      selectedDate={selectedDate}
                      onSelect={setSelectedDate}
                      fallbackGoal={goal || DEFAULT_GOAL}
                    />
                  )}
                </Card.Content>
              </Card>
            )}
        </div>
      </div>

      <footer className="mt-10 text-center text-xs text-plum-soft/70">
        MèoCalo 🐱 · Dữ liệu lưu trên Supabase · Calo chỉ mang tính tham khảo
      </footer>
    </main>
  );
}

/* ---- Bộ tính gợi ý calo (Mifflin–St Jeor) ---- */
function GoalCalculator({ onApply }: { onApply: (v: number) => void }) {
  const [sex, setSex] = useState<"female" | "male">("female");
  const [age, setAge] = useState("25");
  const [weight, setWeight] = useState("55");
  const [height, setHeight] = useState("160");
  const [activity, setActivity] = useState(1.375);

  const levels = [
    { f: 1.2, label: "Ít" },
    { f: 1.375, label: "Nhẹ" },
    { f: 1.55, label: "Vừa" },
    { f: 1.725, label: "Nhiều" },
  ];

  const tdee = useMemo(() => {
    const a = Number(age);
    const w = Number(weight);
    const h = Number(height);
    if (!a || !w || !h) return 0;
    // Mifflin–St Jeor: nam +5, nữ -161
    const bmr = 10 * w + 6.25 * h - 5 * a + (sex === "male" ? 5 : -161);
    return Math.round((bmr * activity) / 10) * 10;
  }, [sex, age, weight, height, activity]);

  return (
    <div className="animate-pop-in space-y-3 rounded-2xl bg-blush p-3">
      {/* Giới tính */}
      <div className="flex gap-1.5">
        {(
          [
            { id: "female", label: "Nữ 👧" },
            { id: "male", label: "Nam 👦" },
          ] as const
        ).map((s) => (
          <Button
            key={s.id}
            size="sm"
            variant={sex === s.id ? "primary" : "outline"}
            onPress={() => setSex(s.id)}
            className={
              sex === s.id
                ? "flex-1 rounded-full"
                : "flex-1 rounded-full border-rose-soft text-plum-soft"
            }
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <LabeledInput label="Tuổi" value={age} onChange={setAge} />
        <LabeledInput label="Cân (kg)" value={weight} onChange={setWeight} />
        <LabeledInput label="Cao (cm)" value={height} onChange={setHeight} />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-plum-soft">Vận động</p>
        <div className="flex flex-wrap gap-1.5">
          {levels.map((l) => (
            <Button
              key={l.f}
              size="sm"
              variant={activity === l.f ? "primary" : "outline"}
              onPress={() => setActivity(l.f)}
              className={
                activity === l.f
                  ? "rounded-full"
                  : "rounded-full border-rose-soft text-plum-soft"
              }
            >
              {l.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-rose-tint px-3 py-2">
        <span className="text-sm font-semibold text-plum">Gợi ý</span>
        <span className="font-display text-lg font-bold text-rose">
          {tdee} kcal
        </span>
      </div>
      <Button
        size="sm"
        variant="primary"
        fullWidth
        onPress={() => tdee > 0 && onApply(tdee)}
        className="rounded-full font-bold"
      >
        Dùng mức này
      </Button>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-plum-soft">
        {label}
      </span>
      <Input
        aria-label={label}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
