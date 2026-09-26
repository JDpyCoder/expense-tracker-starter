import { useState } from 'react'

function TransactionForm({ categories, onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("food");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = description.trim();
    const value = Number(amount);
    const missing = { description: !text, amount: !(value > 0) };
    if (missing.description || missing.amount) {
      setError(missing);
      return;
    }
    setError(null);

    // Local calendar date; toISOString() would give the UTC date.
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');

    onAdd({
      id: Date.now(),
      description: text,
      amount: value,
      type,
      category,
      date,
    });

    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("food");
  };

  let errorMessage = null;
  if (error?.description && error?.amount) {
    errorMessage = "Please enter a description and an amount.";
  } else if (error?.description) {
    errorMessage = "Please enter a description.";
  } else if (error?.amount) {
    errorMessage = "Please enter an amount greater than 0.";
  }

  return (
    <div className="add-transaction">
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Description"
          aria-invalid={error?.description || undefined}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Amount"
          aria-invalid={error?.amount || undefined}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errorMessage && (
          <p className="form-error" role="alert">{errorMessage}</p>
        )}
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default TransactionForm
