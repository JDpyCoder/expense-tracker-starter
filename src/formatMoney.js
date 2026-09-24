const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatMoney = (amount) => dollars.format(amount);
