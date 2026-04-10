import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { LoanResults } from "@/lib/loanCalculations";
import { formatSAR } from "@/lib/loanCalculations";

interface LoanChartProps {
  lang: Lang;
  results: LoanResults;
}

const COLORS = {
  principal: "hsl(162, 72%, 28%)",
  interest: "hsl(42, 80%, 52%)",
};

export function LoanChart({ lang, results }: LoanChartProps) {
  const { loanAmount, totalInterest, principalPercentage, interestPercentage, amortizationSchedule } = results as LoanResults & { loanAmount: number };

  const pieData = [
    {
      name: t(lang, "principal"),
      value: results.totalRepayment - results.totalInterest,
      pct: principalPercentage,
    },
    {
      name: t(lang, "interest"),
      value: results.totalInterest,
      pct: interestPercentage,
    },
  ];

  // Sample schedule for bar chart — show every N months for readability
  const scheduleLen = amortizationSchedule.length;
  const step = Math.max(1, Math.floor(scheduleLen / 12));
  const barData = amortizationSchedule
    .filter((_, i) => i % step === 0 || i === scheduleLen - 1)
    .map(entry => ({
      month: entry.month,
      [t(lang, "principalPaid")]: Number(entry.principal.toFixed(0)),
      [t(lang, "interestPaid")]: Number(entry.interest.toFixed(0)),
    }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-card-border rounded-xl p-2.5 shadow-lg text-xs">
          {payload.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: i === 0 ? COLORS.principal : COLORS.interest }}
              />
              <span className="text-muted-foreground">{p.name}:</span>
              <span className="font-semibold">{formatSAR(p.value, 0)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { pct: number } }[] }) => {
    if (active && payload?.length) {
      const item = payload[0];
      return (
        <div className="bg-card border border-card-border rounded-xl p-2.5 shadow-lg text-xs">
          <p className="font-semibold">{item.name}</p>
          <p className="text-muted-foreground">{formatSAR(item.value)}</p>
          <p className="text-muted-foreground">{item.payload.pct.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Pie Chart */}
      <div>
        <h3 className="text-sm font-semibold mb-3">{t(lang, "chartTitle")}</h3>
        <div className="flex items-center gap-4">
          <div className="w-36 h-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? COLORS.principal : COLORS.interest}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: i === 0 ? COLORS.principal : COLORS.interest }}
                />
                <div className="flex-1">
                  <p className="text-xs font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSAR(item.value)}</p>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: i === 0 ? COLORS.principal : COLORS.interest }}
                >
                  {item.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart - Amortization trend */}
      {barData.length > 1 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">
            {lang === "ar" ? "مسار السداد الشهري" : "Monthly Payment Breakdown"}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }} barSize={6}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  label={{ value: lang === "ar" ? "الشهر" : "Month", position: "insideBottom", offset: -2, fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey={t(lang, "principalPaid")} fill={COLORS.principal} radius={[2, 2, 0, 0]} />
                <Bar dataKey={t(lang, "interestPaid")} fill={COLORS.interest} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
