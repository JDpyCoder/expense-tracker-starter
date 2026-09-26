# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is the starter project for Mosh Hamedani's Claude Code course. Per the README, it
**intentionally shipped with a bug, poor UI, and messy code** — those are the course
exercises, fixed incrementally over the lessons rather than all at once. Work already done:
the amount-type bug in the summary totals is fixed, the single `App` component has been
split into `Summary` / `SpendingChart` / `TransactionForm` / `TransactionList`, rows can
be deleted, money is formatted as currency, the amount field accepts cents, and the add
form validates its input with an inline error. Other rough edges remain. Do not "clean up" or refactor opportunistically: only
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
npm run lint     # eslint . (all *.js/*.jsx, dist/ ignored)
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
| `TransactionForm.jsx` | `categories`, `onAdd` | the 4 controlled add-form fields, `error` (validation), `handleSubmit` |
| `TransactionList.jsx` | `transactions`, `categories`, `onDelete` | `filterType` / `filterCategory`, `filteredTransactions`, the per-row Delete button |

The dividing principle: state that only one subtree reads lives in that subtree. Only
`transactions` is lifted to `App`, because `Summary`, `SpendingChart` and `TransactionList`
all read it, and `TransactionForm` (add) and `TransactionList` (delete) write it. Put new
state in the child that uses it, and lift only on a second consumer.

**Delete flow:** each row's `.delete-btn` calls `onDelete(t.id, t.description)`. The
confirmation lives in `App`, not in `TransactionList`; the list only reports which row was
clicked. Because the list deletes by `id`, it works the same whether or not a filter is
active.

**Add-form validation:** `handleSubmit` trims the description (leading/trailing whitespace
only; inner spaces are kept) and requires the trimmed text to be non-empty and
`Number(amount) > 0`. On failure it stores `error = { description, amount }` (booleans for
which fields failed) and returns without calling `onAdd`; the render derives one of three
messages from it, shown in a `<p className="form-error" role="alert">` above the Add
button, and sets `aria-invalid` on the failing inputs. A successful add clears `error`.
The error is not cleared while typing — it updates on the next submit. Trimming happens on
submit, not on change, so users can still type a space between words. The amount input has
`step="0.01" min="0.01"` so the browser accepts cents.

**`SpendingChart`** uses `recharts` (the only runtime dependency beyond React). It sums
`amount` for `type === "expense"` rows grouped by `category`, colors each bar from its own
local `CATEGORY_COLORS` map (falling back to `other`), and shows "No expenses yet." when
there are none. Its axis, grid and tooltip colors are hex literals, because Recharts props
can't read CSS variables. Most mirror `index.css` tokens (`#29403a` = `--hairline`,
`#8ea39b` = `--muted`, `#e2ebe6` = `--ink`, `#162823` = `--sheet`); `#1c312b` (tooltip
cursor) is shared with the hardcoded `tbody tr:hover` color in `App.css`, and `#223731`
(grid) is chart-only. Keep them in sync by hand. The tooltip uses `formatMoney`; the Y-axis
ticks deliberately stay as compact `` `$${v}` `` (e.g. `$1200`).

### Helper modules

Two plain-JS helper modules sit in `src/`:

| File | Exports | Used by |
|---|---|---|
| `formatMoney.js` | `formatMoney(amount)` — `Intl.NumberFormat` en-US USD, e.g. `-$2,370.00` | `Summary.jsx` (all three cards), `TransactionList.jsx` (amount column, after the `+`/`-` sign), `SpendingChart.jsx` (tooltip) |
| `categoryColors.js` | `CATEGORY_COLORS`, `categoryColor(category)` (falls back to `other`) | **nothing yet** — `SpendingChart.jsx` still inlines an identical map |

Render every new money value through `formatMoney`, not a literal `$` before the number.
If you edit category colors, change both `categoryColors.js` and `SpendingChart.jsx` until
the chart is switched to import the helper.

All derived values (totals, filtered rows) are recomputed inline in the render body of the
component that owns them — no memos, no reducer, no context. State resets on reload; there
is no persistence.

`categories` is defined in `App.jsx` and passed to both `TransactionForm` and
`TransactionList`, which must agree on one list. It is the only prop drilled purely for
sharing; a `categories.js` module imported by both would remove it, but that has not been
done.

**`Summary` and `SpendingChart` receive the unfiltered `transactions`, not
`filteredTransactions`** — both are deliberately over the full set, so changing a filter
moves the table while the summary cards and chart hold steady. Preserve that unless asked to change it.

### Data shape

A transaction is `{ id, description, amount, type, category, date }`, with `amount` as a
**number**. `TransactionForm.handleSubmit` builds the whole object — including `id`
(`Date.now()`) and `date` — and passes it up through `onAdd`; `App` never constructs one.
The number input yields a string, so `handleSubmit` coerces with `Number(amount)` before
calling `onAdd`. Preserve that at any new write path: `Summary`'s reducers and
`SpendingChart`'s per-category totals add `t.amount` directly, and a stray string would
silently concatenate instead of adding. `description` is stored trimmed.

`type` is `"income"` or `"expense"` and drives the summary split, which rows the spending
chart counts (expenses only), and the +/- sign and color in the table.

## Styling

Plain CSS, no framework or preprocessor. `src/index.css` (imported by `main.jsx`) holds the
`:root` color/radius tokens (`--paper`, `--sheet`, `--ink`, `--muted`, `--hairline`,
`--income`, `--expense`, `--radius-*`), a global reset, `body` defaults and the global focus
ring; the Manrope font is loaded in `index.html`. `src/App.css` holds *all* component styles — it is imported once, by `App.jsx`,
and applies globally, so the child components carry no CSS import of their own. Its rules
are keyed to the semantic class names now spread across the component files
(`.app` / `.subtitle` in `App.jsx`, `.summary` / `.summary-card` / `.balance-amount` in
`Summary.jsx`, `.spending-chart` in `SpendingChart.jsx`, `.add-transaction` / `.form-error`
in `TransactionForm.jsx`, `.transactions` / `.filters` / `.delete-btn` in
`TransactionList.jsx`, `.income-amount` / `.expense-amount` in both `Summary.jsx` and
`TransactionList.jsx`). Class names are the contract between `App.css` and those files —
rename in both places, and grep before assuming a class has a single home.

Class names are not the whole contract. `.app` is a CSS grid with named areas, so the visual
order differs from the JSX order (chart and form sit side by side on desktop; below 760px
the form comes before the chart). Some rules target elements and position instead of
classes: `h1`, bare `form` / `form input` / `form select` / `form button`,
`form select:last-of-type` (spans the full row), `form input[aria-invalid="true"]` (red
border), `td:nth-child(n)` / `th:nth-child(4)` / `:first-child` / `:last-child` in the
table, and `.summary-card:nth-child(n)::before`, which draws the `−` and `=` operators
between the three summary cards. Adding or reordering form controls, table columns or
summary cards changes styling.
