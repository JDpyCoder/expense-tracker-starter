import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function SpendingChart({ transactions }) {
  const totals = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

  const data = Object.entries(totals).map(([category, total]) => ({ category, total }));

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
            <Bar dataKey="total" name="Spent" fill="#d9534f" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SpendingChart
