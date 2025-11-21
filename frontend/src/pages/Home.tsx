import { useState, useEffect } from "react";
import BaseButton from "@/components/BaseButton";
import { useAppSelector } from "@/utils/useRedux";
import {
  getRecords,
  createRecord,
} from "@/stores/features/records/recordThunk";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

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

export default function Home() {
  const [records, setRecords] = useState<Record[]>([]);
  console.log(records);
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<Record>({
    date: today,
    workoutPlan: "",
    dietType: "低碳日",
    carbs: "",
    fat: "",
    protein: "",
    calories: "",
    goalStatus: "",
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 分頁
  const totalPages = Math.ceil(records.length / pageSize);
  const paginatedRecords = records.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const { user } = useAppSelector((state) => state.authThunk);

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

    const payload = {
      userId: user!.userId,
      ...form,
    };

    const res = await createRecord(payload);

    if (res.success === "RECORD_ADDED") {
      // 更新 UI：重新撈資料 or append
      setRecords((prev) => [payload, ...prev]);
    }

    // 送出後清空
    setForm({
      date: today,
      workoutPlan: "",
      dietType: "低碳日",
      carbs: "",
      fat: "",
      protein: "",
      calories: "",
      goalStatus: "",
    });
  };

  return (
    <div className="w-full h-full">
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Form Card */}
        <section className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg shadow-primaryBlue/50">
          <h2 className="text-lg font-semibold mb-4">新增每日記錄</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 第一行：日期 & 星期 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-primaryBlue"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Diet Type
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-primaryBlue"
                  value={form.dietType}
                  onChange={(e) => handleChange("dietType", e.target.value)}
                >
                  <option value="低碳日">低碳日</option>
                  <option value="中碳日">中碳日</option>
                  <option value="高碳日">高碳日</option>
                </select>
              </div>
            </div>

            {/* 第二行：運動安排 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Workout Plan
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-primaryBlue"
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
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-primaryBlue"
                  value={form.carbs}
                  onChange={(e) => handleChange("carbs", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fat</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-primaryBlue"
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
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-primaryBlue"
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
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-primaryBlue"
                  value={form.calories}
                  onChange={(e) => handleChange("calories", e.target.value)}
                />
              </div>
            </div>

            {/* 第四行*/}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-4 flex justify-end">
                <BaseButton
                  // type="submit"
                  className="inline-flex items-center bg-emerald-400 px-4 py-2 text-sm font-semibold text-primary hover:!bg-emerald-300 transition-colors"
                >
                  新增記錄
                </BaseButton>
              </div>
            </div>
          </form>
        </section>

        {/* Table */}
        <section className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 shadow-lg shadow-primaryBlue/50">
          <h2 className="text-lg font-semibold mb-4">每日紀錄</h2>

          <div className="overflow-x-auto">
            {/* 桌機版 Table */}
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-primaryBlue text-left">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Workout</th>
                  <th className="px-3 py-2">Diet Type</th>
                  <th className="px-3 py-2">Carbs</th>
                  <th className="px-3 py-2">Fat</th>
                  <th className="px-3 py-2">Protein</th>
                  <th className="px-3 py-2">Calories</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRecords.map((r, idx) => (
                  <tr
                    key={idx}
                    className="
                      border-b border-primaryBlue/60
                      odd:bg-primaryBlue/10 odd:dark:bg-primaryBlue/50
                      even:bg-primaryBlue/20 even:dark:bg-primaryBlue
                      hover:bg-primaryBlue/30
                      transition-colors
                    "
                  >
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3 py-2">{r.workoutPlan}</td>
                    <td className="px-3 py-2">{r.dietType}</td>
                    <td className="px-3 py-2">{r.carbs || "-"}</td>
                    <td className="px-3 py-2">{r.fat || "-"}</td>
                    <td className="px-3 py-2">{r.protein || "-"}</td>
                    <td className="px-3 py-2">{r.calories || "-"}</td>
                    <td className="px-3 py-2">{r.goalStatus || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 手機版 Card */}
            <div className="sm:hidden space-y-4">
              {paginatedRecords.map((r, idx) => (
                <div
                  key={idx}
                  className="
                    p-4 rounded-xl border border-primaryBlue/50 
                    odd:bg-primaryBlue/10 odd:dark:bg-primaryBlue/50
                    even:bg-primaryBlue/20 even:dark:bg-primaryBlue
                    hover:bg-primaryBlue/30 transition-colors
                  "
                >
                  <div className="font-semibold text-lg">{r.date}</div>

                  <div className="mt-2">
                    <span className="font-medium">Workout: </span>
                    <span>{r.workoutPlan || "-"}</span>
                  </div>

                  <div>
                    <span className="font-medium">Diet Type: </span>
                    <span>{r.dietType || "-"}</span>
                  </div>

                  {/* Nutrition Row */}
                  <div className="flex justify-between mt-3 text-sm">
                    <div>
                      <span className="text-slate-400">Carbs: </span>
                      {r.carbs || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">Fat: </span>
                      {r.fat || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">Protein: </span>
                      {r.protein || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">Calories: </span>
                      {r.calories || "-"}
                    </div>
                  </div>

                  <div className="mt-1">
                    <span className="font-medium">Status: </span>
                    {r.goalStatus || "-"}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 mt-4">
              <BaseButton
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-200 disabled:opacity-50 text-primary"
              >
                <ArrowBigLeft size={16} />
              </BaseButton>

              <span className="text-sm">
                {page} / {totalPages}
              </span>

              <BaseButton
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-200 disabled:opacity-50 text-primary"
              >
                <ArrowBigRight size={16} />
              </BaseButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
