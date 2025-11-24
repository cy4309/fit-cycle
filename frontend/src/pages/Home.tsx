import { useState, useEffect, useMemo } from "react";
import BaseButton from "@/components/BaseButton";
import { useAppSelector } from "@/utils/useRedux";
import {
  getRecords,
  createRecord,
} from "@/stores/features/records/recordThunk";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { calculateMacroRules } from "@/utils/calcMacros";
import {
  checkNumberWithTolerance,
  checkRangeWithTolerance,
} from "@/utils/macroCompare";
import Swal from "sweetalert2";

type DietType = "低碳日" | "中碳日" | "高碳日";

export type Record = {
  date: string; // e.g. 2025/11/16
  workoutPlan: string;
  dietType: DietType;
  carbs: string; // 先用 string 比較好處理空值，之後再轉 number
  fat: string;
  protein: string;
  calories: string;
  goalStatus: string;
};

function getWeekday(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

export default function Home() {
  const today = new Date().toLocaleDateString("en-CA");
  const createDefaultForm = (): Record => ({
    date: today,
    workoutPlan: "",
    dietType: "低碳日",
    carbs: "",
    fat: "",
    protein: "",
    calories: "",
    goalStatus: "",
  });
  const [records, setRecords] = useState<Record[]>([]);
  const [form, setForm] = useState<Record>(createDefaultForm());
  const [showFormula, setShowFormula] = useState(false); // 控制公式收合
  const [showMacros, setShowMacros] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const totalPages = Math.ceil(records.length / pageSize);
  const paginatedRecords = records.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const { user } = useAppSelector((state) => state.authThunk);
  const macros = useMemo(() => {
    if (!user?.height || !user?.weight || !user?.birth) return null;
    return calculateMacroRules(
      Number(user.weight),
      Number(user.height),
      user.birth
    );
  }, [user]);

  useEffect(() => {
    async function loadRecords() {
      if (!user?.userId) return;

      const res = await getRecords(Number(user.userId));

      if (!res || !Array.isArray(res.records)) {
        console.warn("No record array:", res);
        setRecords([]);
        return;
      }

      setRecords(res.records.reverse()); // 最新 → 最前
    }

    loadRecords();
  }, [user]);

  const handleChange = (field: keyof Record, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.date?.trim()) {
      return Swal.fire({
        icon: "error",
        title: "請選擇日期",
        confirmButtonColor: "#ef4444",
      });
    }

    if (!form.workoutPlan?.trim()) {
      return Swal.fire({
        icon: "error",
        title: "請輸入今日運動內容",
        confirmButtonColor: "#ef4444",
      });
    }

    if (!form.dietType?.trim()) {
      return Swal.fire({
        icon: "error",
        title: "請選擇飲食類型",
        confirmButtonColor: "#ef4444",
      });
    }

    // 養分欄位（全部都必填）
    const numericFields = ["carbs", "fat", "protein", "calories"] as const;

    for (const field of numericFields) {
      const value = form[field];

      if (value === "" || value === null || value === undefined) {
        return Swal.fire({
          icon: "error",
          title: `${field} 欄位不得為空`,
          confirmButtonColor: "#ef4444",
        });
      }

      if (isNaN(Number(value))) {
        return Swal.fire({
          icon: "error",
          title: `${field} 欄位必須是數字`,
          confirmButtonColor: "#ef4444",
        });
      }

      if (Number(value) <= 0) {
        return Swal.fire({
          icon: "error",
          title: `${field} 必須大於 0`,
          confirmButtonColor: "#ef4444",
        });
      }
    }

    // ----------- 正式送出 -----------
    const weekday = getWeekday(form.date);
    const payload = {
      userId: user!.userId,
      ...form,
      date: `${form.date} | ${weekday}`, // <-- 存入 date + weekday
    };

    const res = await createRecord(payload);

    if (res.error) {
      return Swal.fire({
        icon: "error",
        title: "新增失敗",
        text: res.error,
        confirmButtonColor: "#ef4444",
      });
    }

    if (res.success === "RECORD_ADDED") {
      // 更新 UI：重新撈資料 or append
      setRecords((prev) => [payload, ...prev]);
      Swal.fire({
        icon: "success",
        title: "新增成功！",
        timer: 1500,
        showConfirmButton: false,
      });
      // 送出後清空
      setForm(createDefaultForm());
    }
  };

  return (
    <div className="w-full h-full">
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Form Card */}
        <section className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg shadow-decoratedGray/50">
          <h2 className="text-lg font-semibold mb-4">新增每日記錄</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 第一行：日期 & 星期 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-decoratedGray appearance-none"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Diet Type
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-decoratedGray appearance-none"
                    value={form.dietType}
                    onChange={(e) => handleChange("dietType", e.target.value)}
                  >
                    <option value="低碳日">低碳日</option>
                    <option value="中碳日">中碳日</option>
                    <option value="高碳日">高碳日</option>
                  </select>
                  {/* 自訂箭頭 */}
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* 第二行：運動安排 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Workout Plan
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-decoratedGray"
                value={form.workoutPlan}
                onChange={(e) => handleChange("workoutPlan", e.target.value)}
              />
            </div>

            {/* 第三行：營養素 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Carbs</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-decoratedGray"
                  value={form.carbs}
                  onChange={(e) => handleChange("carbs", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fat</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-decoratedGray"
                  value={form.fat}
                  onChange={(e) => handleChange("fat", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Protein
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-decoratedGray"
                  value={form.protein}
                  onChange={(e) => handleChange("protein", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-decoratedGray"
                  value={form.calories}
                  onChange={(e) => handleChange("calories", e.target.value)}
                />
              </div>
            </div>

            {/* 第四行*/}
            <div className="grid md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-4 flex justify-end space-x-4">
                <BaseButton
                  // type="submit"
                  className="inline-flex items-center bg-decoratedGreen px-4 py-2 text-sm font-semibold text-primary hover:!bg-emerald-300 transition-colors"
                >
                  <Plus size={16} />
                  新增記錄
                </BaseButton>
              </div>
            </div>
          </form>
        </section>

        {/* 公式區 */}
        <section
          className="
            sticky top-24 z-50 
            border border-slate-200 dark:border-slate-700 
            rounded-2xl p-6 
            shadow-lg shadow-decoratedGray/50 
            bg-secondary dark:bg-primary
          "
        >
          {!macros ? (
            <p className="text-sm text-slate-400">尚未載入建議攝取量...</p>
          ) : (
            <div className="space-y-4">
              {/* ===== 標準 TDEE 區 ===== */}
              <h3 className="text-lg font-bold">標準 TDEE 建議</h3>

              <div className="space-x-4 space-y-1 flex flex-wrap">
                {/* ===== 折疊公式 ===== */}
                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className="text-sm text-slate-400 transition flex items-center gap-1"
                >
                  {/* {showFormula ? "▲ 收合計算公式" : "▼ 展開計算公式"} */}
                  {showFormula ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {showFormula ? "收合計算公式" : "展開計算公式"}
                </button>

                {showFormula && (
                  <div className="text-xs text-slate-400 space-y-1 leading-relaxed border border-slate-600 rounded-md p-3">
                    <p className="font-semibold">計算公式：</p>
                    <p>・BMR = 10 × 體重 + 6.25 × 身高 − 5 × 年齡 + 5</p>
                    <p>・TDEE = BMR × 活動係數（1.55 中度活動）</p>
                    <p>・低碳日熱量 = TDEE × 0.68 ~ 0.72</p>
                    <p>・中碳日熱量 = TDEE × 0.80 ~ 0.90</p>
                    <p>・高碳日熱量 = TDEE × 0.95 ~ 1.05</p>
                    <p>・碳水 4 kcal/g、脂肪 9 kcal/g、蛋白質 4 kcal/g</p>

                    <hr className="border-slate-700 my-2" />

                    {/* ===== 新增：紅字顯示規則 ===== */}
                    <p className="font-semibold">紅字顯示規則：</p>

                    <ul className="list-disc ml-4 space-y-1">
                      <li>
                        <span className="text-slate-400">碳水 (Carbs)：</span>
                        超過或低於建議值{" "}
                        <span className="font-semibold">±10 g</span> → 顯示紅色
                      </li>
                      <li>
                        <span className="text-slate-400">脂肪 (Fat)：</span>
                        超過或低於建議值{" "}
                        <span className="font-semibold">±5 g</span> → 顯示紅色
                      </li>
                      <li>
                        <span className="text-slate-400">
                          蛋白質 (Protein)：
                        </span>
                        低於 <span className="font-semibold">最低值</span> 或
                        高於 <span className="font-semibold">最高值</span> →
                        紅色
                      </li>
                      <li>
                        <span className="text-slate-400">
                          熱量 (Calories)：
                        </span>
                        超出建議範圍{" "}
                        <span className="font-semibold">±100 kcal</span> → 紅色
                      </li>
                    </ul>
                  </div>
                )}

                {/* ===== 折疊 Macros 顯示區 ===== */}
                <button
                  onClick={() => setShowMacros(!showMacros)}
                  className="text-sm text-slate-400 transition flex items-center gap-1"
                >
                  {showMacros ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {showMacros ? "收合TDEE建議" : "展開TDEE建議"}
                </button>

                {showMacros && (
                  <div className="text-xs text-slate-400 space-y-1 leading-relaxed border border-slate-600 rounded-md p-3">
                    {/* Carbs */}
                    <p className="text-sm text-slate-400 font-medium">
                      <span className="font-semibold">Carbs：</span>
                      低-{Math.round(macros["低碳日"].carbs)}， 中-
                      {Math.round(macros["中碳日"].carbs)}， 高-
                      {Math.round(macros["高碳日"].carbs)}
                    </p>

                    {/* Fat */}
                    <p className="text-sm text-slate-400 font-medium">
                      <span className="font-semibold">Fat：</span>
                      低-{Math.round(macros["低碳日"].fat)}， 中-
                      {Math.round(macros["中碳日"].fat)}， 高-
                      {Math.round(macros["高碳日"].fat)}
                    </p>

                    {/* Protein */}
                    <p className="text-sm text-slate-400 font-medium">
                      <span className="font-semibold">Protein：</span>
                      {macros["低碳日"].protein.min} ~{" "}
                      {macros["低碳日"].protein.max}
                    </p>

                    {/* Calories */}
                    <p className="text-sm text-slate-400 font-medium">
                      <span className="font-semibold">Calories：</span>
                      低-{Math.round(macros["低碳日"].calories.min)}~
                      {Math.round(macros["低碳日"].calories.max)}， 中-
                      {Math.round(macros["中碳日"].calories.min)}~
                      {Math.round(macros["中碳日"].calories.max)}， 高-
                      {Math.round(macros["高碳日"].calories.min)}~
                      {Math.round(macros["高碳日"].calories.max)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Table */}
        <section className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 shadow-lg shadow-decoratedGray/50">
          <h2 className="text-lg font-semibold mb-4">每日紀錄</h2>

          <div className="overflow-x-auto">
            {/* 桌機版 Table */}
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-decoratedGray text-left">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Workout</th>
                  <th className="px-3 py-2">Diet Type</th>
                  <th className="px-3 py-2">Carbs</th>
                  <th className="px-3 py-2">Fat</th>
                  <th className="px-3 py-2">Protein</th>
                  <th className="px-3 py-2">Calories</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRecords.map((r, idx) => {
                  const rule = macros?.[r.dietType];

                  const carbsStatus = rule
                    ? checkNumberWithTolerance(Number(r.carbs), rule.carbs)
                    : "ok";

                  const fatStatus = rule
                    ? checkNumberWithTolerance(Number(r.fat), rule.fat)
                    : "ok";

                  const proteinStatus = rule
                    ? checkRangeWithTolerance(
                        Number(r.protein),
                        rule.protein.min,
                        rule.protein.max
                      )
                    : "ok";

                  const calorieStatus = rule
                    ? checkRangeWithTolerance(
                        Number(r.calories),
                        rule.calories.min,
                        rule.calories.max
                      )
                    : "ok";

                  const color = {
                    ok: "text-decoratedGreen",
                    low: "text-orange-400",
                    high: "text-decoratedRed",
                  };

                  return (
                    <tr
                      key={idx}
                      className="
                        border-b border-decoratedGray/60
                        odd:bg-decoratedGray/10 odd:dark:bg-decoratedGray/50
                        even:bg-decoratedGray/20 even:dark:bg-decoratedGray
                        hover:bg-decoratedGray/30
                        transition-colors font-bold
                      "
                    >
                      <td className="px-3 py-2">{r.date}</td>
                      <td className="px-3 py-2">{r.workoutPlan}</td>
                      <td className="px-3 py-2">{r.dietType}</td>
                      <td className={`px-3 py-2 ${color[carbsStatus]}`}>
                        {r.carbs}
                      </td>
                      <td className={`px-3 py-2 ${color[fatStatus]}`}>
                        {r.fat}
                      </td>
                      <td className={`px-3 py-2 ${color[proteinStatus]}`}>
                        {r.protein}
                      </td>
                      <td className={`px-3 py-2 ${color[calorieStatus]}`}>
                        {r.calories}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 手機版 Card */}
            <div className="sm:hidden space-y-4">
              {paginatedRecords.map((r, idx) => {
                const rule = macros?.[r.dietType];

                const carbsStatus = rule
                  ? checkNumberWithTolerance(Number(r.carbs), rule.carbs)
                  : "ok";

                const fatStatus = rule
                  ? checkNumberWithTolerance(Number(r.fat), rule.fat)
                  : "ok";

                const proteinStatus = rule
                  ? checkRangeWithTolerance(
                      Number(r.protein),
                      rule.protein.min,
                      rule.protein.max
                    )
                  : "ok";

                const calorieStatus = rule
                  ? checkRangeWithTolerance(
                      Number(r.calories),
                      rule.calories.min,
                      rule.calories.max
                    )
                  : "ok";

                const color = {
                  ok: "text-decoratedGreen",
                  low: "text-orange-400",
                  high: "text-decoratedRed",
                };

                return (
                  <div
                    key={idx}
                    className="
                      p-4 rounded-xl border border-decoratedGray/50 
                      odd:bg-decoratedGray/10 odd:dark:bg-decoratedGray/50
                      even:bg-decoratedGray/20 even:dark:bg-decoratedGray
                      hover:bg-decoratedGray/30 transition-colors font-bold
                    "
                  >
                    <div className="font-semibold text-lg">{r.date}</div>

                    <div className="mt-2 text-sm">
                      <span className="font-medium">Workout: </span>
                      <span>{r.workoutPlan || "-"}</span>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="font-medium">Diet Type: </span>
                      <span>{r.dietType || "-"}</span>
                    </div>

                    {/* Nutrition */}
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div className={color[carbsStatus]}>
                        <span className="text-slate-400">Carbs: </span>
                        {r.carbs || "-"}
                      </div>

                      <div className={color[fatStatus]}>
                        <span className="text-slate-400">Fat: </span>
                        {r.fat || "-"}
                      </div>

                      <div className={color[proteinStatus]}>
                        <span className="text-slate-400">Protein: </span>
                        {r.protein || "-"}
                      </div>

                      <div className={color[calorieStatus]}>
                        <span className="text-slate-400">Calories: </span>
                        {r.calories || "-"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center items-center gap-4 mt-4">
              <BaseButton
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-200 disabled:opacity-50 text-primary"
              >
                <ChevronLeft size={16} />
              </BaseButton>

              <span className="text-sm">
                {page} / {totalPages}
              </span>

              <BaseButton
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-200 disabled:opacity-50 text-primary"
              >
                <ChevronRight size={16} />
              </BaseButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
