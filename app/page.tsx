"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Chip, Input } from "@heroui/react";
import CalorieRing from "@/components/CalorieRing";
import CatMascot from "@/components/CatMascot";
import WeightChart, { WeightPoint } from "@/components/WeightChart";
import { MEALS, MealType, QUICK_FOODS } from "@/lib/foods";

type Entry = {
  id: string;
  name: string;
  kcal: number;
  meal: MealType;
};

const GOAL_KEY = "meocalo:goal";
const ENTRIES_KEY = "meocalo:entries";
const WEIGHTS_KEY = "meocalo:weights";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export default function Page() {
  const [loaded, setLoaded] = useState(false);
  const [goal, setGoal] = useState(1800);
  const [entries, setEntries] = useState<Entry[]>([]);

  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [meal, setMeal] = useState<MealType>("breakfast");

  const [showCalc, setShowCalc] = useState(false);

  // Cân nặng theo ngày
  const [weights, setWeights] = useState<WeightPoint[]>([]);
  const [wDate, setWDate] = useState(todayISO());
  const [wKg, setWKg] = useState("");

  // Nạp dữ liệu đã lưu
  useEffect(() => {
    try {
      const g = localStorage.getItem(GOAL_KEY);
      const e = localStorage.getItem(ENTRIES_KEY);
      const w = localStorage.getItem(WEIGHTS_KEY);
      if (g) setGoal(Number(g) || 1800);
      if (e) setEntries(JSON.parse(e));
      if (w) setWeights(JSON.parse(w));
    } catch {
      /* bỏ qua */
    }
    setLoaded(true);
  }, []);

  // Lưu lại mỗi khi thay đổi
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(GOAL_KEY, String(goal));
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
      localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
    } catch {
      /* bỏ qua */
    }
  }, [goal, entries, weights, loaded]);

  const consumed = useMemo(
    () => entries.reduce((sum, e) => sum + e.kcal, 0),
    [entries]
  );

  function addEntry(n: string, k: number, m: MealType) {
    const kk = Math.round(k);
    if (!n.trim() || !kk || kk <= 0) return;
    setEntries((prev) => [
      ...prev,
      { id: newId(), name: n.trim(), kcal: kk, meal: m },
    ]);
  }

  function handleAdd() {
    addEntry(name, Number(kcal), meal);
    setName("");
    setKcal("");
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function clearAll() {
    setEntries([]);
  }

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

  // Danh sách cân nặng đã sắp theo ngày tăng dần
  const sortedWeights = useMemo(
    () => [...weights].sort((a, b) => a.date.localeCompare(b.date)),
    [weights]
  );

  function saveWeight() {
    const kg = parseFloat(wKg.replace(",", "."));
    if (!wDate || !kg || kg <= 0 || kg > 500) return;
    setWeights((prev) => {
      const rest = prev.filter((w) => w.date !== wDate); // ghi đè nếu trùng ngày
      return [...rest, { date: wDate, kg: Math.round(kg * 10) / 10 }];
    });
    setWKg("");
  }

  function removeWeight(date: string) {
    setWeights((prev) => prev.filter((w) => w.date !== date));
  }

  // Thống kê cân nặng
  const wStats = useMemo(() => {
    if (sortedWeights.length === 0) return null;
    const first = sortedWeights[0];
    const last = sortedWeights[sortedWeights.length - 1];
    const kgs = sortedWeights.map((w) => w.kg);
    const min = Math.min(...kgs);
    const max = Math.max(...kgs);
    const change = Math.round((last.kg - first.kg) * 10) / 10;
    return { first, last, min, max, change, count: sortedWeights.length };
  }, [sortedWeights]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      {/* Tiêu đề */}
      <header className="mb-8 flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <CatMascot mood="happy" size={64} className="animate-floaty" />
          <h1 className="font-display text-4xl font-bold text-plum sm:text-5xl">
            Mèo<span className="text-rose">Calo</span>
          </h1>
        </div>
        <p className="mt-2 text-sm font-semibold text-plum-soft sm:text-base">
          Ghi lại calo mỗi ngày cùng bé mèo dễ thương 🐾
        </p>
        <p className="mt-1 text-xs capitalize text-plum-soft/80">
          {todayLabel()}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cột trái: nhập món + nhật ký */}
        <div className="space-y-6 lg:col-span-2">
          {/* Thêm món */}
          <Card className="border border-rose-soft/60 bg-cream shadow-sm">
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
          <Card className="border border-rose-soft/60 bg-cream shadow-sm">
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
                    <span className="ml-1 text-xs text-plum-soft">
                      {f.kcal}
                    </span>
                  </Button>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Nhật ký theo bữa */}
          <Card className="border border-rose-soft/60 bg-cream shadow-sm">
            <Card.Header className="flex items-center justify-between">
              <Card.Title className="font-display text-lg font-bold text-plum">
                Nhật ký hôm nay 📖
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
                    Thêm món đầu tiên của bạn ở phía trên nhé.
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

        {/* Cột phải: vòng calo + mục tiêu */}
        <div className="lg:col-span-1">
          <div className="space-y-6 lg:sticky lg:top-6">
            <Card className="border border-rose-soft/60 bg-cream shadow-sm">
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
                      {Math.max(0, Math.round(((consumed / goal) * 100) || 0))}%
                    </div>
                    <div className="text-xs font-semibold text-plum-soft">
                      mục tiêu
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Mục tiêu */}
            <Card className="border border-rose-soft/60 bg-cream shadow-sm">
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
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-plum-soft">
                    kcal
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onPress={() => setShowCalc((s) => !s)}
                  className="rounded-full border-rose-soft text-plum-soft"
                >
                  {showCalc ? "Ẩn gợi ý" : "Gợi ý theo cơ thể 🧮"}
                </Button>

                {showCalc && <GoalCalculator onApply={(v) => setGoal(v)} />}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* ====== Cân nặng theo ngày ====== */}
      <section className="mt-6">
        <Card className="border border-rose-soft/60 bg-cream shadow-sm">
          <Card.Header>
            <Card.Title className="font-display text-xl font-bold text-plum">
              Cân nặng theo ngày ⚖️
            </Card.Title>
            <Card.Description className="text-plum-soft">
              Ghi lại cân nặng để xem bé tiến bộ thế nào 🐾
            </Card.Description>
          </Card.Header>
          <Card.Content className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Biểu đồ */}
              <div className="lg:col-span-2">
                {sortedWeights.length === 0 ? (
                  <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl bg-blush py-8 text-center">
                    <CatMascot mood="content" size={92} />
                    <p className="font-semibold text-plum">Chưa có dữ liệu cân nặng</p>
                    <p className="text-sm text-plum-soft">
                      Nhập cân nặng đầu tiên ở bên cạnh nhé.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-blush p-3">
                    <WeightChart data={sortedWeights} />
                  </div>
                )}
              </div>

              {/* Form nhập */}
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-plum-soft">
                    Ngày
                  </span>
                  <Input
                    aria-label="Ngày cân"
                    type="date"
                    value={wDate}
                    max={todayISO()}
                    onChange={(e) => setWDate(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-plum-soft">
                    Cân nặng (kg)
                  </span>
                  <Input
                    aria-label="Cân nặng"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="vd: 55.5"
                    value={wKg}
                    onChange={(e) => setWKg(e.target.value)}
                  />
                </label>
                <Button
                  variant="primary"
                  fullWidth
                  onPress={saveWeight}
                  className="rounded-full font-bold"
                >
                  Lưu cân nặng 💾
                </Button>
                {weights.some((w) => w.date === wDate) && (
                  <p className="text-center text-xs text-plum-soft">
                    Đã có số của ngày này — lưu sẽ ghi đè.
                  </p>
                )}
              </div>
            </div>

            {/* Thống kê */}
            {wStats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile
                  label="Hiện tại"
                  value={`${wStats.last.kg.toFixed(1)} kg`}
                  tone="rose"
                />
                <StatTile
                  label="Thay đổi"
                  value={`${wStats.change > 0 ? "+" : ""}${wStats.change.toFixed(1)} kg`}
                  tone={wStats.change > 0 ? "up" : wStats.change < 0 ? "down" : "neutral"}
                />
                <StatTile label="Thấp nhất" value={`${wStats.min.toFixed(1)} kg`} tone="mint" />
                <StatTile label="Cao nhất" value={`${wStats.max.toFixed(1)} kg`} tone="lilac" />
              </div>
            )}

            {/* Lịch sử */}
            {sortedWeights.length > 0 && (
              <div>
                <p className="mb-2 font-display font-bold text-plum">Lịch sử 📒</p>
                <ul className="space-y-2">
                  {[...sortedWeights].reverse().map((w, i, arr) => {
                    const prev = arr[i + 1]; // ngày liền trước (cũ hơn)
                    const diff = prev ? Math.round((w.kg - prev.kg) * 10) / 10 : null;
                    return (
                      <li
                        key={w.date}
                        className="animate-pop-in flex items-center justify-between rounded-2xl bg-blush px-4 py-2.5"
                      >
                        <span className="font-semibold text-plum">
                          {w.date.split("-").reverse().join("/")}
                        </span>
                        <span className="flex items-center gap-3">
                          {diff !== null && diff !== 0 && (
                            <span
                              className={`text-xs font-bold ${
                                diff > 0 ? "text-rose-deep" : "text-emerald-500"
                              }`}
                            >
                              {diff > 0 ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
                            </span>
                          )}
                          <span className="font-bold text-rose">{w.kg.toFixed(1)} kg</span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={`Xoá ngày ${w.date}`}
                            onPress={() => removeWeight(w.date)}
                            className="text-plum-soft hover:text-rose-deep"
                          >
                            ✕
                          </Button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Card.Content>
        </Card>
      </section>

      <footer className="mt-10 text-center text-xs text-plum-soft/70">
        MèoCalo 🐱 · Dữ liệu được lưu ngay trên máy bạn · Calo chỉ mang tính
        tham khảo
      </footer>
    </main>
  );
}

/* ---- Ô thống kê cân nặng ---- */
function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "rose" | "up" | "down" | "neutral" | "mint" | "lilac";
}) {
  const bg: Record<string, string> = {
    rose: "bg-rose-tint",
    up: "bg-rose-tint",
    down: "bg-mint/50",
    neutral: "bg-blush",
    mint: "bg-mint/50",
    lilac: "bg-lilac",
  };
  const fg: Record<string, string> = {
    rose: "text-rose",
    up: "text-rose-deep",
    down: "text-emerald-600",
    neutral: "text-plum",
    mint: "text-plum",
    lilac: "text-plum",
  };
  return (
    <div className={`rounded-2xl px-3 py-2.5 text-center ${bg[tone]}`}>
      <div className={`font-display text-lg font-bold ${fg[tone]}`}>{value}</div>
      <div className="text-xs font-semibold text-plum-soft">{label}</div>
    </div>
  );
}

/* ---- Bộ tính gợi ý calo (Mifflin–St Jeor) ---- */
function GoalCalculator({ onApply }: { onApply: (v: number) => void }) {
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
    // Công thức cho nữ
    const bmr = 10 * w + 6.25 * h - 5 * a - 161;
    return Math.round((bmr * activity) / 10) * 10;
  }, [age, weight, height, activity]);

  return (
    <div className="animate-pop-in space-y-3 rounded-2xl bg-blush p-3">
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
