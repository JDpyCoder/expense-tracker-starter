# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is the starter project for Mosh Hamedani's Claude Code course. Per the README, it
**intentionally shipped with a bug, poor UI, and messy code** — those are the course
exercises, fixed incrementally over the lessons rather than all at once. Work already done:
the amount-type bug in the summary totals is fixed, the single `App` component has been
split into `Summary` / `SpendingChart` / `TransactionForm` / `TransactionList`, and rows can
be deleted. Other rough edges remain. Do not "clean up" or refactor opportunistically: only
change what the user asks for, and mention defects you notice rather than silently fixing
them.

Known remaining oddity, left alone on purpose: the seed row `Freelance Work` ($800) is
typed `"expense"` while sitting in the `salary` category, which reads like it was meant to
be income.

## Commands

```bash
npm install
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the built dist/
npm run lint     # ESLint over **/*.{js,jsx}
```

**There is no test framework installed** — no Vitest, Jest, or test runner of any kind,
and no test files. Do not suggest or invoke a test command. To verify a change, run the
dev server and drive the app in a browser.

## Architecture

React 19 + Vite SPA, no router and no backend. `src/main.jsx` mounts `App` under
`StrictMode`. Flat file layout — components live directly in `src/`, one per file, each a
plain function with a default export.

`App.jsx` is the composition root and the only stateful owner of shared data. It holds the
`transactions` array (seeded with 8 hardcoded rows) and the two handlers that write it:

- `handleAddTransaction(transaction)` appends immutably.
- `handleDeleteTransaction(id, description)` asks ``window.confirm(`Delete "${description}"?`)``
  and, if confirmed, removes the row with `transactions.filter(t => t.id !== id)`.

It renders four children, in this order, and nothing else of substance:

| Component | Props | Owns |
|---|---|---|
| `Summary.jsx` | `transactions` | derives `totalIncome` / `totalExpenses` / `balance` |
| `SpendingChart.jsx` | `transactions` | derives per-category expense totals; renders a Recharts bar chart |
| `TransactionForm.jsx` | `categories`, `onAdd` | the 4 controlled add-form fields, `handleSubmit` |
| `TransactionList.jsx` | `transactions`, `categories`, `onDelete` | `filterType` / `filterCategory`, `filteredTransactions`, the per-row Delete button |

The dividing principle: state that only one subtree reads lives in that subtree. Only
`transactions` is lifted to `App`, because `Summary`, `SpendingChart` and `TransactionList`
all read it, and `TransactionForm` (add) and `TransactionList` (delete) write it. Put new
state in the child that uses it, and lift only on a second consumer.

**Delete flow:** each row's `.delete-btn` calls `onDelete(t.id, t.description)`. The
confirmation lives in `App`, not in `TransactionList`; the list only reports which row was
clicked. Because the list deletes by `id`, it works the same whether or not a filter is
active.

**`SpendingChart`** uses `recharts` (the only runtime dependency beyond React). It sums
`amount` for `type === "expense"` rows grouped by `category`, colors each bar from its own
local `CATEGORY_COLORS` map (falling back to `other`), and shows "No expenses yet." when
there are none. Its axis, grid and tooltip colors are hex literals that mirror the CSS
tokens in `index.css`, because Recharts props can't read CSS variables; keep them in sync
by hand. Its `$${v}` tick/tooltip formatting is separate from `formatMoney`.

### Helper modules

Two plain-JS helper modules sit in `src/`. **Neither is imported anywhere yet**:

| File | Exports | Notes |
|---|---|---|
| `categoryColors.js` | `CATEGORY_COLORS`, `categoryColor(category)` | same map as the one inlined in `SpendingChart.jsx`; `categoryColor` falls back to `other` |
| `formatMoney.js` | `formatMoney(amount)` | `Intl.NumberFormat` en-US USD, e.g. `-$2,370.00` |

Money is still rendered as raw `$${n}` template strings in `Summary.jsx`,
`TransactionList.jsx` and `SpendingChart.jsx`, so negatives show as `$-2370` and there are no
thousands separators. If you edit category colors, change both `categoryColors.js` and
`SpendingChart.jsx` until the chart is switched to import the helper.

All derived values (totals, filtered rows) are recomputed inline in the render body of the
component that owns them — no memos, no reducer, no context. State resets on reload; there
is no persistence.

`categories` is defined in `App.jsx` and passed to both `TransactionForm` and
`TransactionList`, which must agree on one list. It is the only prop drilled purely for
sharing; a `categories.js` module imported by both would remove it, but that has not been
done.

**`Summary` receives the unfiltered `transactions`, not `filteredTransactions`** — the
totals are deliberately over the full set, so changing a filter moves the table while the
summary cards hold steady. Preserve that unless asked to change it.

### Data shape

A transaction is `{ id, description, amount, type, category, date }`, with `amount` as a
**number**. `TransactionForm.handleSubmit` builds the whole object — including `id`
(`Date.now()`) and `date` — and passes it up through `onAdd`; `App` never constructs one.
The number input yields a string, so `handleSubmit` coerces with `Number(amount)` before
calling `onAdd`. Preserve that at any new write path: `Summary`'s reducers add `t.amount`
directly, and a stray string would silently concatenate instead of adding.

`type` is `"income"` or `"expense"` and drives both the summary split and the +/- sign and
color in the table.

## Styling

Plain CSS, no framework or preprocessor. `src/index.css` is a global reset plus `body`
defaults; `src/App.css` holds *all* component styles — it is imported once, by `App.jsx`,
and applies globally, so the child components carry no CSS import of their own. Its rules
are keyed to the semantic class names now spread across the component files
(`.summary-card` / `.balance-amount` in `Summary.jsx`, `.spending-chart` in
`SpendingChart.jsx`, `.add-transaction` in `TransactionForm.jsx`, `.transactions` /
`.filters` / `.delete-btn` in `TransactionList.jsx`, `.income-amount` / `.expense-amount`
in both `Summary.jsx` and `TransactionList.jsx`). Class names are the contract between
`App.css` and those files — rename in both places, and grep before assuming a class has a
single home.
