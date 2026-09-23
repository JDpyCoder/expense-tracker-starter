import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => `$${v}`} />
            <Bar dataKey="total" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SpendingChart
