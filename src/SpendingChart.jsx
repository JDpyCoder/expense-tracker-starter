import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from './formatMoney.js'

const CATEGORY_COLORS = {
  food: "#e8743b",
  housing: "#3b7dd8",
  utilities: "#19a979",
  transport: "#945ecf",
  entertainment: "#e24d7a",
  salary: "#13a4b4",
  other: "#8a8f98",
};

function SpendingChart({ transactions }) {
  const totals = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

  const data = Object.entries(totals).map(([category, total]) => ({
    category,
    total,
    fill: CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other,
  }));

  return (
    <div className="spending-chart">
      <h2>Spending by Category</h2>
      {data.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="#223731" vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={{ stroke: "#29403a" }}
              tick={{ fill: "#8ea39b", fontSize: 13 }}
              tickFormatter={c => c.charAt(0).toUpperCase() + c.slice(1)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8ea39b", fontSize: 13 }}
              tickFormatter={v => `$${v}`}
            />
            <Tooltip
              formatter={v => formatMoney(v)}
              cursor={{ fill: "#1c312b" }}
              labelStyle={{ color: "#e2ebe6", fontWeight: 700 }}
              contentStyle={{ background: "#162823", color: "#e2ebe6", border: "1px solid #29403a", borderRadius: 8, fontFamily: "Manrope, sans-serif" }}
            />
            <Bar dataKey="total" name="Spent" radius={[6, 6, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SpendingChart
